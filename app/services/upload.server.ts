import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import { PassThrough } from "node:stream";
import type { Readable } from "stream";
import {
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "~/utils/env.server";

let client: S3Client;

const getS3Client = async () => {
  if (!client) {
    client = new S3Client({
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      region: AWS_REGION,
    });
  }

  return client;
};

async function uploadStreamToSpaces(stream: Readable, filename: string) {
  return new Upload({
    client: await getS3Client(),
    leavePartsOnError: false,
    params: {
      Bucket: AWS_BUCKET_NAME,
      Key: filename,
      Body: stream,
      ACL: "public-read",
    },
  }).done();
}

export async function uploadImage(
  data: AsyncIterable<Uint8Array>,
  filename: string,
) {
  const stream = new PassThrough();
  await writeAsyncIterableToWritable(data, stream);
  return uploadStreamToSpaces(stream, filename);
}

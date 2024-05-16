import { writeAsyncIterableToWritable } from "@remix-run/node";
import cloudinary from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "~/utils/env.server";

cloudinary.v2.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  data: AsyncIterable<Uint8Array>,
  folder: string,
): Promise<cloudinary.UploadApiResponse> {
  return new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload image"));
          return;
        }
        resolve(result);
      },
    );
    await writeAsyncIterableToWritable(data, uploadStream);
  });
}

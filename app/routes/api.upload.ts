import {
  ActionFunction,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  LoaderFunction,
  unstable_parseMultipartFormData as parseMultipartFormData,
  redirect,
  UploadHandler,
  writeAsyncIterableToWritable,
} from "@remix-run/node";
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

export const loader: LoaderFunction = async () => redirect("/sign-in");

export const action: ActionFunction = async ({ params, request }) => {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  if (!folder) {
    return json({ error: "Folder is required" }, { status: 400 });
  }

  const uploadHandler: UploadHandler = composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== "file") {
        return undefined;
      }

      const uploadedImage = await uploadImage(data, folder);
      return uploadedImage.secure_url;
    },
    createMemoryUploadHandler(),
  );

  const multipartFormData = await parseMultipartFormData(
    request,
    uploadHandler,
  );
  const imageUrl = multipartFormData.get("file");

  if (!imageUrl) {
    return json({ error: "Failed to fetch image" });
  }

  return json({ url: imageUrl });
};

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
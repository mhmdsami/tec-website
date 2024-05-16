import {
  ActionFunction,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  LoaderFunction,
  unstable_parseMultipartFormData as parseMultipartFormData,
  redirect,
  UploadHandler,
} from "@remix-run/node";
import { uploadImage } from "~/utils/upload.server";

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

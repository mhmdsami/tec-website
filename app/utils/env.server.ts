import { object, parse, string } from "valibot";

const EnvSchema = object({
  SESSION_SECRET: string("SESSION_SECRET is missing in .env"),
  DATABASE_URL: string("DATABASE_URL is missing in .env"),
  CLOUDINARY_CLOUD_NAME: string("CLOUDINARY_CLOUD_NAME is missing in .env"),
  CLOUDINARY_API_KEY: string("CLOUDINARY_API_KEY is missing in .env"),
  CLOUDINARY_API_SECRET: string("CLOUDINARY_API_SECRET is missing in .env"),
});

export const {
  SESSION_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = parse(EnvSchema, process.env);

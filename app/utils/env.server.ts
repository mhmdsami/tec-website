import { object, parse, string } from "valibot";

const EnvSchema = object({
  SESSION_SECRET: string("SESSION_SECRET is missing in .env"),
  DATABASE_URL: string("DATABASE_URL is missing in .env"),
  AWS_REGION: string("AWS_REGION is missing in .env"),
  AWS_ACCESS_KEY_ID: string("AWS_ACCESS_KEY_ID is missing in .env"),
  AWS_SECRET_ACCESS_KEY: string("AWS_SECRET_ACCESS_KEY is missing in .env"),
  AWS_BUCKET_NAME: string("AWS_BUCKET_NAME is missing in .env"),
  FROM_NAME: string("FROM_NAME is missing in .env"),
  FROM_MAIL: string("FROM_EMAIL is missing in .env"),
});

export const {
  SESSION_SECRET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
  FROM_NAME,
  FROM_MAIL,
} = parse(EnvSchema, process.env);

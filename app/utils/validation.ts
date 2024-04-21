import {
  BaseSchema,
  Output,
  ValiError,
  email,
  includes,
  length,
  minLength,
  object,
  parse,
  string,
  url,
} from "valibot";

type ValidatedForm<Schema extends BaseSchema> =
  | {
      success: true;
      data: Output<Schema>;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

export const SignUpSchema = object({
  name: string("Name is required", [
    minLength(3, "Name must be at least 3 characters"),
  ]),
  email: string("Email is required", [
    email("Please enter a valid email address"),
  ]),
  password: string("Password is required", [
    minLength(8, "Password must be at least 8 characters"),
  ]),
});

export const SignInSchema = object({
  email: string("Email is required", [
    email("Please enter a valid email address"),
  ]),
  password: string("Password is required", [
    minLength(3, "Password is required"),
  ]),
});

export const BusinessSchema = object({
  name: string("Name is required", [
    minLength(3, "Name must be at least 3 characters"),
  ]),
  typeId: string("Type is required", [minLength(3, "Select a business type")]),
  tagline: string("Tagline is required", [
    minLength(5, "Tagline must be at least 5 characters"),
  ]),
  about: string("About is required", [
    minLength(5, "About must be at least 5 characters"),
  ]),
  location: string([minLength(3, "Location must be at least 3 characters")]),
  instagram: string([
    minLength(3, "Instagram must be at least 3 characters"),
    url("Please enter a valid URL"),
    includes("instagram.com", "Please enter a valid Instagram URL"),
  ]),
  whatsApp: string([length(10, "Enter a valid WhatsApp number")]),
  email: string("Email is required", [
    email("Please enter a valid email address"),
  ]),
  phone: string("Phone is required", [
    length(10, "Enter a valid Phone number"),
  ]),
});

export const VerifyBusinessSchema = object({
  id: string("ID is required", [minLength(1, "ID is required")]),
});

export const AddBusinessTypeSchema = object({
  name: string("Name is required", [
    minLength(3, "Name must be at least 3 characters"),
  ]),
});

export const DeleteBusinessTypeSchema = object({
  id: string("ID is required", [minLength(1, "ID is required")]),
});

export const EnquirySchema = object({
  name: string("Name is required", [
    minLength(3, "Name must be at least 3 characters"),
  ]),
  email: string("Email is required", [
    email("Please enter a valid email address"),
  ]),
  phone: string("Phone is required", [
    length(10, "Enter a valid Phone number"),
  ]),
  message: string("Message is required", [
    minLength(5, "Message must be at least 5 characters"),
  ]),
});

export const ResolveEnquirySchema = object({
  id: string("ID is required", [minLength(1, "ID is required")]),
});

export const validate = <T extends BaseSchema>(
  data: Record<string, unknown>,
  schema: T,
): ValidatedForm<T> => {
  try {
    const parsed = parse(schema, data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof ValiError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path) {
          errors[String(issue.path[0].key)] = issue.message;
        }
      });
      return { success: false, errors: errors };
    }

    return { success: false, errors: { error: "Something went wrong" } };
  }
};

export type { Output } from "valibot";

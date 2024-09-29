import {
  GenericSchema,
  InferOutput,
  ValiError,
  check,
  date,
  email,
  includes,
  length,
  minLength,
  object,
  optional,
  parse,
  picklist,
  pipe,
  string,
  transform,
  url,
} from "valibot";

export const SignUpSchema = object({
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  password: pipe(
    string("Password is required"),
    minLength(8, "Password must be at least 8 characters"),
  ),
  type: optional(picklist(["USER", "BUSINESS"]), "USER"),
});

export const SignInSchema = object({
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  password: pipe(
    string("Password is required"),
    minLength(3, "Password is required"),
  ),
});

export const DeleteUserSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const UpdateUserSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  type: picklist(["USER", "BUSINESS", "ADMIN"]),
});

export const ResetPasswordRequestSchema = object({
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
});

export const ResetPasswordSchema = object({
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  password: pipe(
    string("Password is required"),
    minLength(8, "Password must be at least 8 characters"),
  ),
});

export const ContactFormSchema = object({
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  phone: pipe(
    string("Phone is required"),
    length(10, "Enter a valid Phone number"),
  ),
  message: pipe(
    string("Message is required"),
    minLength(5, "Message must be at least 5 characters"),
  ),
});

export const ResolveContactSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const BusinessSchema = object({
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  categoryId: pipe(
    string("Category is required"),
    minLength(3, "Select a business category"),
  ),
  typeId: pipe(
    string("Type is required"),
    minLength(3, "Select a business type"),
  ),
  tagline: pipe(
    string("Tagline is required"),
    minLength(5, "Tagline must be at least 5 characters"),
  ),
  about: pipe(
    string("About is required"),
    minLength(5, "About must be at least 5 characters"),
  ),
  logo: optional(string(), ""),
  coverImage: optional(string(), ""),
  location: optional(
    pipe(string(), minLength(3, "Location must be at least 3 characters")),
  ),
  instagram: pipe(
    string(),
    minLength(3, "Instagram must be at least 3 characters"),
    url("Please enter a valid URL"),
    includes("instagram.com", "Please enter a valid Instagram URL"),
  ),
  whatsApp: pipe(string(), length(10, "Enter a valid WhatsApp number")),
  facebook: optional(string()),
  linkedIn: optional(string()),
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  phone: pipe(
    string("Phone is required"),
    length(10, "Enter a valid Phone number"),
  ),
});

export const BusinessUpdateSchema = object({
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  tagline: pipe(
    string("Tagline is required"),
    minLength(5, "Tagline must be at least 5 characters"),
  ),
  about: pipe(
    string("About is required"),
    minLength(5, "About must be at least 5 characters"),
  ),
  logo: optional(string()),
  coverImage: optional(string()),
  location: optional(
    pipe(string(), minLength(3, "Location must be at least 3 characters")),
  ),
  instagram: pipe(
    string(),
    minLength(3, "Instagram must be at least 3 characters"),
    url("Please enter a valid URL"),
    includes("instagram.com", "Please enter a valid Instagram URL"),
  ),
  whatsApp: pipe(string(), length(10, "Enter a valid WhatsApp number")),
  facebook: optional(string()),
  linkedIn: optional(string()),
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  phone: pipe(
    string("Phone is required"),
    length(10, "Enter a valid Phone number"),
  ),
});

export const VerifyBusinessSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const AddBusinessCategorySchema = object({
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
});

export const DeleteBusinessCategorySchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const AddBusinessTypeSchema = object({
  categoryId: pipe(
    string("Category is required"),
    minLength(1, "Select a business category"),
  ),
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
});

export const DeleteBusinessTypeSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const EnquirySchema = object({
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  phone: pipe(
    string("Phone is required"),
    length(10, "Enter a valid Phone number"),
  ),
  message: pipe(
    string("Message is required"),
    minLength(5, "Message must be at least 5 characters"),
  ),
});

export const ResolveEnquirySchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const AddEventSchema = object({
  title: pipe(
    string("Title is required"),
    minLength(3, "Title must be at least 3 characters"),
  ),
  description: pipe(
    string("Description is required"),
    minLength(5, "Description must be at least 5 characters"),
  ),
  date: date("Date is required"),
});

export const UpdateEventSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
  title: pipe(
    string("Title is required"),
    minLength(3, "Title must be at least 3 characters"),
  ),
  description: pipe(
    string("Description is required"),
    minLength(5, "Description must be at least 5 characters"),
  ),
  date: date("Date is required"),
});

export const ToggleEventCompletionSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const AddEventRegistrationSchema = object({
  eventId: pipe(string("Event ID is required"), minLength(1, "ID is required")),
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  email: pipe(
    string("Email is required"),
    email("Please enter a valid email address"),
  ),
  phone: pipe(
    string("Phone is required"),
    length(10, "Enter a valid Phone number"),
  ),
  isMember: pipe(
    string("Membership status is required"),
    transform((value) => value === "true"),
  ),
  businessName: pipe(
    string("Business Name is required"),
    minLength(3, "Business Name must be at least 3 characters"),
  ),
  categoryId: pipe(
    string("Category is required"),
    minLength(3, "Select a business category"),
  ),
  location: pipe(
    string("Location is required"),
    minLength(3, "Location must be at least 3 characters"),
  ),
});

export const DeleteEventSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const AddEventImageSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
  image: string("Image is required"),
  description: optional(string()),
});

export const AddBlogSchema = object({
  title: pipe(
    string("Title is required"),
    minLength(3, "Title must be at least 3 characters"),
  ),
  description: pipe(
    string("Description is required"),
    minLength(5, "Description must be at least 5 characters"),
  ),
  content: pipe(
    string("Content is required"),
    minLength(50, "Content must be at least 50 characters"),
  ),
  image: pipe(string("Image is required"), minLength(3, "Image is required")),
});

export const EditBlogSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
  title: pipe(
    string("Title is required"),
    minLength(3, "Title must be at least 3 characters"),
  ),
  description: pipe(
    string("Description is required"),
    minLength(5, "Description must be at least 5 characters"),
  ),
  content: pipe(
    string("Content is required"),
    minLength(50, "Content must be at least 50 characters"),
  ),
  image: pipe(string("Image is required"), minLength(3, "Image is required")),
});

export const DeleteBlogSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const AddImageSchema = object({
  url: string("Image is required"),
  description: optional(string()),
});

export const AddServiceSchema = object({
  title: pipe(
    string("Title is required"),
    minLength(3, "Title must be at least 3 characters"),
  ),
  description: pipe(
    string("Description is required"),
    minLength(5, "Description must be at least 5 characters"),
  ),
  image: optional(string()),
});

export const EditServiceSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
  title: pipe(
    string("Title is required"),
    minLength(3, "Title must be at least 3 characters"),
  ),
  description: pipe(
    string("Description is required"),
    minLength(5, "Description must be at least 5 characters"),
  ),
  image: optional(string()),
});

export const DeleteServiceSchema = object({
  id: pipe(string("ID is required"), minLength(1, "ID is required")),
});

export const ReceiptSchema = object({
  wing: pipe(string("Wing is required"), minLength(3, "Select a wing")),
  type: pipe(
    string("Type is required"),
    minLength(3, "Type must be at least 3 characters"),
  ),
  name: pipe(
    string("Name is required"),
    minLength(3, "Name must be at least 3 characters"),
  ),
  phone: pipe(
    string("Phone is required"),
    length(10, "Enter a valid Phone number"),
  ),
  date: date("Date is required"),
  address: pipe(
    string("Address is required"),
    minLength(5, "Address must be at least 5 characters"),
  ),
  amount: pipe(
    string("Amount is required"),
    minLength(1, "Amount is required"),
    transform((value) => Number(value)),
  ),
});

export const BusinessClinicSchema = object({
  monthlySales: pipe(
    string("Monthly sales is required"),
    picklist(
      [
        "Less than 50,000",
        "50,000 - 1,00,000",
        "1,00,000 - 2,50,000",
        "2,50,000 - 5,00,000",
        "5,00,00 - 10,00,000",
        "10,00,000 - 25,00,000",
        "25,00,000 - 50,00,000",
        "50,00,000 - 1,00,00,000",
        "More than 1,00,00,000",
      ],
      "Select a valid option",
    ),
  ),
  numberOfEmployees: pipe(
    string("Number of employees is required"),
    picklist(
      [
        "Less than 5",
        "5 - 10",
        "10 - 25",
        "25 - 50",
        "50 - 100",
        "More than 100",
      ],
      "Select a valid option",
    ),
  ),
  haveDepartmentHeads: pipe(
    optional(string(), "false"),
    transform((value) => value === "true"),
  ),
  numberOfDepartmentHeads: optional(
    pipe(
      string("Select a valid option"),
      picklist(
        ["1", "2", "3", "4", "5", "5 to 10", "More than 10"],
        "Select a valid option",
      ),
    ),
  ),
  yearsInBusiness: pipe(
    string("Years in business is required"),
    transform((n) => parseInt(n)),
    check((n) => n > 0, "Enter a valid value"),
  ),
  natureOfBusiness: pipe(
    string("Nature of business is required"),
    picklist(
      [
        "Sole Proprietor",
        "Partnership",
        "Private Limited Company",
        "Public Company",
      ],
      "Select a valid option",
    ),
  ),
  segmentations: pipe(
    string("Segmentation is required"),
    picklist(["B2B", "B2C", "Both"], "Select a valid option"),
  ),
  customerClassification: pipe(
    string("Customer classification is required"),
    picklist(
      [
        "Class A Segment",
        "Class B Segment",
        "Class C Segment",
        "All of the Above",
      ],
      "Select a valid option",
    ),
  ),
  challenges: pipe(
    string("Challenges is required"),
    minLength(3, "Challenges must be at least 3 characters"),
  ),
  burningChallenge: pipe(
    string("Burning challenge is required"),
    minLength(3, "Burning challenge must be at least 3 characters"),
  ),
});

type ValidatedForm<Schema extends GenericSchema> =
  | {
      success: true;
      data: InferOutput<Schema>;
    }
  | {
      success: false;
      errors: Record<string, string>;
    };

export const validate = <T extends GenericSchema>(
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

export type { InferOutput } from "valibot";

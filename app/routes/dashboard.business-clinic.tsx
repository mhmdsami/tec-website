import { valibotResolver } from "@hookform/resolvers/valibot";
import { BusinessClinic } from "@prisma-app/client";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InferInput } from "valibot";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { cn } from "~/utils/helpers";
import { requireUserId } from "~/utils/session.server";
import { ActionResponse, LoaderResponse } from "~/utils/types";
import { BusinessClinicSchema, validate } from "~/utils/validation";

export const meta: MetaFunction = () => [
  { title: `${siteConfig.name} | Business Clinic` },
  { name: "description", content: siteConfig.description },
];

type LoaderData = {
  previousSubmission: BusinessClinic[];
};

export const loader: LoaderFunction = async ({
  request,
}): LoaderResponse<LoaderData> => {
  const userId = await requireUserId(request);

  const previousSubmission = await db.businessClinic.findMany({
    where: {
      business: {
        ownerId: userId,
      },
    },
  });

  return json({ previousSubmission });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());

  const parseRes = validate(body, BusinessClinicSchema);
  if (!parseRes.success) {
    return json({ fieldErrors: parseRes.errors }, { status: 400 });
  }

  const submission = await db.businessClinic.create({
    data: {
      ...parseRes.data,
      business: {
        connect: {
          ownerId: userId,
        },
      },
    },
  });

  if (!submission) {
    return json({ error: "Failed to submit" }, 500);
  }

  return json({ message: "Submitted successfully" });
};

export default function DashboardBusinessClinic() {
  const { previousSubmission } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  const [isOpen, setIsOpen] = useState(false);
  useActionDataWithToast({
    onMessage: () => setIsOpen(false),
  });

  const table = useReactTable({
    data: previousSubmission,
    columns: [
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => (
          <p>
            {new Date(row.original.createdAt).toLocaleDateString(["en-IN"])}
          </p>
        ),
      },
      {
        accessorKey: "id",
        header: "Actions",
        cell: ({ row }) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button>View Details</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogHeader>
                  <DialogTitle>Business Clinic</DialogTitle>
                  <DialogDescription>
                    Details entered by you on{" "}
                    {new Date(row.original.createdAt).toLocaleDateString([
                      "en-IN",
                    ])}
                  </DialogDescription>
                </DialogHeader>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input
                  name="monthlySales"
                  label="Monthly sales"
                  value={row.original.monthlySales}
                  disabled
                />
                <Input
                  name="numberOfEmployees"
                  label="Number of Employees"
                  value={row.original.numberOfEmployees}
                  disabled
                />
                <Input
                  name="haveDepartmentHeads"
                  label="Have Department Heads"
                  value={row.original.haveDepartmentHeads ? "Yes" : "No"}
                  disabled
                />
                {row.original.numberOfDepartmentHeads && (
                  <Input
                    name="numberOfDepartmentHeads"
                    label="Number of Department Heads"
                    value={row.original.numberOfDepartmentHeads}
                    disabled
                  />
                )}
                <Input
                  name="natureOfBusiness"
                  label="Nature of Business"
                  value={row.original.natureOfBusiness}
                  disabled
                />
                <Input
                  name="segmentations"
                  label="Company Segmentation"
                  value={row.original.segmentations}
                  disabled
                />
                <Input
                  name="customerClassification"
                  label="Customer Classification"
                  value={row.original.customerClassification}
                  disabled
                />
                <Textarea
                  name="challenges"
                  label="Challenges"
                  value={row.original.challenges}
                  disabled
                />
                <Textarea
                  name="burningChallenge"
                  label="Challenges"
                  value={row.original.burningChallenge}
                  disabled
                />
              </div>
            </DialogContent>
          </Dialog>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    watch,
  } = useForm<InferInput<typeof BusinessClinicSchema>>({
    defaultValues: {
      monthlySales: "",
      numberOfEmployees: "",
      haveDepartmentHeads: "false",
      natureOfBusiness: "",
      segmentations: "",
      customerClassification: "",
      challenges: "",
      burningChallenge: "",
    },
    resolver: valibotResolver(BusinessClinicSchema),
  });

  return (
    <main className="flex grow flex-col gap-5">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="w-fit self-end">New Submission</Button>
        </SheetTrigger>
        <SheetContent className="overflow-scroll">
          <SheetHeader>
            <SheetTitle>Business Clinic</SheetTitle>
            <SheetDescription>
              Kindly share the below details to take up support from Tirunelveli
              Economic Chamber
            </SheetDescription>
          </SheetHeader>
          <Form
            className="mt-3 flex flex-col gap-3"
            onSubmit={handleSubmit((values) =>
              submit(values, { method: "POST" }),
            )}
          >
            <div className="flex flex-col gap-2">
              <Label>Monthly Sales</Label>
              <Controller
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select monthly sales" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 50,000">
                        Less than 50,000
                      </SelectItem>
                      <SelectItem value="50,000 - 1,00,000">
                        50,000 - 1,00,000
                      </SelectItem>
                      <SelectItem value="1,00,000 - 2,50,000">
                        1,00,000 - 2,50,000
                      </SelectItem>
                      <SelectItem value="2,50,000 - 5,00,000">
                        2,50,000 - 5,00,000
                      </SelectItem>
                      <SelectItem value="5,00,00 - 10,00,000">
                        5,00,00 - 10,00,000
                      </SelectItem>
                      <SelectItem value="10,00,000 - 25,00,000">
                        10,00,000 - 25,00,000
                      </SelectItem>
                      <SelectItem value="25,00,000 - 50,00,000">
                        25,00,000 - 50,00,000
                      </SelectItem>
                      <SelectItem value="50,00,000 - 1,00,00,000">
                        50,00,000 - 1,00,00,000
                      </SelectItem>
                      <SelectItem value="More than 1,00,00,000">
                        More than 1,00,00,000
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                name="monthlySales"
                control={control}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.monthlySales && "block",
                )}
              >
                {errors.monthlySales?.message}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Number of Employees</Label>
              <Controller
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 5">Less than 5</SelectItem>
                      <SelectItem value="5 - 10">5 - 10</SelectItem>
                      <SelectItem value="10 - 25">10 - 25</SelectItem>
                      <SelectItem value="25 - 50">25 - 50</SelectItem>
                      <SelectItem value="50 - 100">50 - 100</SelectItem>
                      <SelectItem value="More than 100">
                        More than 100
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                name="numberOfEmployees"
                control={control}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.numberOfEmployees && "block",
                )}
              >
                {errors.numberOfEmployees?.message}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Do you have Department Heads in your business?</Label>
              <Controller
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Do you have Department Heads in your business" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                name="haveDepartmentHeads"
                control={control}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.haveDepartmentHeads && "block",
                )}
              >
                {errors.haveDepartmentHeads?.message}
              </p>
            </div>
            {watch("haveDepartmentHeads") === "true" && (
              <div className="flex flex-col gap-2">
                <Label>How many department heads do you have?</Label>
                <Controller
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="5 to 10">5 to 10</SelectItem>
                        <SelectItem value="More than 10">
                          More than 10
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  name="numberOfDepartmentHeads"
                  control={control}
                />
                <p
                  className={cn(
                    "hidden text-sm text-destructive",
                    errors.numberOfDepartmentHeads && "block",
                  )}
                >
                  {errors.numberOfDepartmentHeads?.message}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>Nature of business</Label>
              <Controller
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nature of business" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sole Proprietor">
                        Sole Proprietor
                      </SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Private Limited Company">
                        Private Limited Company
                      </SelectItem>
                      <SelectItem value="Public Company">
                        Public Company
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                name="natureOfBusiness"
                control={control}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.natureOfBusiness && "block",
                )}
              >
                {errors.natureOfBusiness?.message}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Segmentation of your Company</Label>
              <Controller
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Segmentation of your Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B2B">B2B</SelectItem>
                      <SelectItem value="B2C">B2C</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                name="segmentations"
                control={control}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.segmentations && "block",
                )}
              >
                {errors.segmentations?.message}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>
                Customer Classification- Which market do you cater to?
              </Label>
              <Controller
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Customer Classification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class A Segment">
                        Class A Segment
                      </SelectItem>
                      <SelectItem value="Class B Segment">
                        Class B Segment
                      </SelectItem>
                      <SelectItem value="Class C Segment">
                        Class C Segment
                      </SelectItem>
                      <SelectItem value="All of the Above">
                        All of the Above
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                name="customerClassification"
                control={control}
              />
              <p
                className={cn(
                  "hidden text-sm text-destructive",
                  errors.customerClassification && "block",
                )}
              >
                {errors.customerClassification?.message}
              </p>
            </div>
            <Input
              label="Years in business"
              name="yearsInBusiness"
              register={register}
              type="number"
              placeholder="Years in business"
              min={1}
              errorMessage={errors.yearsInBusiness?.message}
            />
            <Textarea
              label="Challenges"
              name="challenges"
              register={register}
              placeholder="Kindly List down your challenges, you are currently facing"
              errorMessage={errors.challenges?.message}
            />
            <Textarea
              label="Burning challenge"
              name="burningChallenge"
              register={register}
              placeholder="Which is the burning challenge which needs to be addressed first?"
              errorMessage={errors.burningChallenge?.message}
            />
            <Button type="submit">Submit</Button>
          </Form>
        </SheetContent>
      </Sheet>
      <h2 className="text-lg font-bold">Previous Submissions</h2>
      <DataTable table={table} />
    </main>
  );
}

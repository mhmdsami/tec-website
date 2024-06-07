import { valibotResolver } from "@hookform/resolvers/valibot";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useSubmit } from "@remix-run/react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { ActionResponse } from "~/types";
import { cn } from "~/utils/helpers";
import { redirectToBasedOnRole } from "~/utils/helpers.server";
import {
  createUserSession,
  redirectToCookie,
  signUp,
} from "~/utils/session.server";
import { SignUpSchema, validate } from "~/utils/validation";

export const meta: MetaFunction = () => {
  return [
    { title: `Sign Up | ${siteConfig.name}` },
    { name: "description", content: `Sign Up for ${siteConfig.name}` },
  ];
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, SignUpSchema);

  const redirectTo = await redirectToCookie.parse(
    request.headers.get("Cookie"),
  );

  if (parseRes.success) {
    const { email, name, password, type } = parseRes.data;
    const res = await signUp(email, name, type, password);
    if (res.success) {
      const { user } = res.data;
      return createUserSession(
        user.id,
        redirectTo || redirectToBasedOnRole(user) || "/dashboard",
      );
    } else {
      return json({ error: res.error }, { status: 400 });
    }
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function SignUp() {
  const submit = useSubmit();
  useActionDataWithToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: valibotResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      type: "USER",
    },
  });

  return (
    <Form
      onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
      className="mx-auto -mt-20 flex w-72 grow flex-col justify-center gap-5 sm:w-80"
    >
      <h1 className="text-3xl font-bold">Create an Account!</h1>
      <Input
        name="name"
        label="Name"
        register={register}
        errorMessage={errors.name?.message}
      />
      <Input
        name="email"
        label="Email"
        register={register}
        errorMessage={errors.email?.message}
      />
      <Input
        name="password"
        label="Password"
        type="password"
        register={register}
        errorMessage={errors.password?.message}
      />
      <div className="flex flex-col gap-2">
        <Label>Sign Up As</Label>
        <Controller
          render={({ field }) => (
            <Select onValueChange={field.onChange} {...field}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
              </SelectContent>
            </Select>
          )}
          name="type"
          control={control}
        />
        <p
          className={cn(
            "hidden text-sm text-destructive",
            errors.type && "block",
          )}
        >
          {errors.type?.message}
        </p>
      </div>
      <Button type="submit" className="text-base font-semibold">
        Sign Up
      </Button>
      <Link
        prefetch="render"
        to="/sign-in"
        className="text-center text-sm text-primary underline"
      >
        Already have an account? Sign in instead!
      </Link>
    </Form>
  );
}

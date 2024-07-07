import { valibotResolver } from "@hookform/resolvers/valibot";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  TypedResponse,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useSubmit } from "@remix-run/react";
import { addMinutes } from "date-fns";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import { db } from "~/utils/db.server";
import { redirectToBasedOnRole } from "~/utils/helpers.server";
import { createUserSession, resetPassword } from "~/utils/session.server";
import type { ActionResponse } from "~/utils/types";
import { ResetPasswordSchema, validate } from "~/utils/validation";

export const meta: MetaFunction = () => {
  return [
    { title: `Reset Password | ${siteConfig.name}` },
    { name: "description", content: `Reset password for ${siteConfig.name}` },
  ];
};

type LoaderData = {
  email: string;
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<TypedResponse<LoaderData>> => {
  const token = new URLSearchParams(request.url.split("?")[1]).get("token");
  if (!token) {
    throw json(
      { message: "Invalid reset link, Token is required" },
      { status: 400 },
    );
  }

  const resetRequest = await db.resetRequest.findUnique({
    where: { token },
  });

  if (!resetRequest) {
    throw json(
      { message: "Invalid token or the password is already reset" },
      { status: 400 },
    );
  }

  if (addMinutes(resetRequest.createdAt, 30) < new Date()) {
    throw json({ message: "Token expired" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: resetRequest.email },
  });

  if (!user) {
    throw json({ message: "User not found" }, { status: 400 });
  }

  return json({ email: user.email });
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const token = new URLSearchParams(request.url.split("?")[1]).get("token");
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, ResetPasswordSchema);

  if (!token) {
    return json(
      { message: "Invalid reset link, Token is required" },
      { status: 400 },
    );
  }

  const resetRequest = await db.resetRequest.findUnique({
    where: { token },
  });

  if (!resetRequest) {
    return json(
      { message: "Invalid token or the password is already reset" },
      { status: 400 },
    );
  }

  if (addMinutes(resetRequest.createdAt, 30) < new Date()) {
    return json({ message: "Token expired" }, { status: 400 });
  }

  if (!parseRes.success) {
    return json({ fieldErrors: parseRes.errors }, { status: 400 });
  }

  const { email, password } = parseRes.data;

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return json({ error: "User not found" }, { status: 400 });
  }

  const res = await resetPassword(email, password);
  if (res.success) {
    const { user } = res.data;
    return createUserSession(
      user.id,
      redirectToBasedOnRole(user) || "/dashboard",
    );
  } else {
    return json({ error: res.error }, { status: 400 });
  }
};

export default function ResetPassword() {
  const { email } = useLoaderData<LoaderData>();
  const submit = useSubmit();
  useActionDataWithToast();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(ResetPasswordSchema),
    defaultValues: {
      email,
      password: "",
    },
  });

  return (
    <Form
      onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
      className="mx-auto -mt-20 flex w-72 grow flex-col justify-center gap-5 sm:w-80"
    >
      <h1 className="text-3xl font-bold">Reset Password</h1>
      <Input name="email" label="Email" register={register} disabled />
      <Input
        name="password"
        label="Password"
        errorMessage={errors.password?.message}
        type="password"
        register={register}
      />
      <Button type="submit" className="text-base font-semibold">
        Reset Password
      </Button>
    </Form>
  );
}

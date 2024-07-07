import { valibotResolver } from "@hookform/resolvers/valibot";
import { ActionFunction, json, type MetaFunction } from "@remix-run/node";
import { Form, Link, useNavigate, useSubmit } from "@remix-run/react";
import * as crypto from "node:crypto";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { sendEmail } from "~/services/mailer.server";
import siteConfig from "~/site.config";
import ResetPassword from "~/templates/reset-password";
import { db } from "~/utils/db.server";
import type { ActionResponse } from "~/utils/types";
import { ResetPasswordRequestSchema, validate } from "~/utils/validation";

export const meta: MetaFunction = () => {
  return [
    { title: `Forgot Password | ${siteConfig.name}` },
    { name: "description", content: `Forgot password for ${siteConfig.name}` },
  ];
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, ResetPasswordRequestSchema);

  if (!parseRes.success) {
    return json({ fieldErrors: parseRes.errors }, { status: 400 });
  }

  const { email } = parseRes.data;
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return json({ error: "User not found" }, { status: 400 });
  }

  const resetRequest = await db.resetRequest.create({
    data: {
      email,
      token: crypto.randomUUID(),
    },
  });

  if (!resetRequest) {
    return json({ error: "Failed to create reset request" }, { status: 500 });
  }

  const isEmailSent = await sendEmail(
    ResetPassword,
    {
      name: user.name,
      token: resetRequest.token,
    },
    email,
    "Reset your password",
  );

  if (!isEmailSent) {
    return json({ error: "Failed to send email" }, { status: 500 });
  }

  return json({ message: "Reset link sent" });
};

export default function ForgotPassword() {
  const submit = useSubmit();
  const navigate = useNavigate();

  useActionDataWithToast({
    onMessage: () => setTimeout(() => navigate("/"), 3000),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(ResetPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <Form
      onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
      className="mx-auto -mt-20 flex w-72 grow flex-col justify-center gap-5 sm:w-80"
    >
      <h1 className="text-3xl font-bold">Forgot Password</h1>
      <Input
        name="email"
        label="Email"
        errorMessage={errors.email?.message}
        register={register}
      />
      <Button type="submit" className="text-base font-semibold">
        Send Reset Link
      </Button>
      <Link
        prefetch="intent"
        to="/sign-up"
        className="text-center text-sm text-primary underline"
      >
        Don't have an account? Create one now!
      </Link>
    </Form>
  );
}

import { valibotResolver } from "@hookform/resolvers/valibot";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useSubmit } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import siteConfig from "~/site.config";
import type { ActionResponse } from "~/types";
import { redirectToBasedOnRole } from "~/utils/helpers.server";
import {
  createUserSession,
  redirectToCookie,
  signIn,
} from "~/utils/session.server";
import { SignInSchema, validate } from "~/utils/validation";

export const meta: MetaFunction = () => {
  return [
    { title: `Sign In | ${siteConfig.name}` },
    { name: "description", content: `Sign In into ${siteConfig.name}` },
  ];
};

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validate(body, SignInSchema);

  const redirectTo = await redirectToCookie.parse(
    request.headers.get("Cookie"),
  );

  if (parseRes.success) {
    const { email, password } = parseRes.data;
    const res = await signIn(email, password);
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

export default function SignIn() {
  const submit = useSubmit();
  useActionDataWithToast();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: valibotResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form
      onSubmit={handleSubmit((data) => submit(data, { method: "post" }))}
      className="mx-auto -mt-20 flex w-72 grow flex-col justify-center gap-5 sm:w-80"
    >
      <h1 className="text-3xl font-bold">Welcome Back!</h1>
      <Input
        name="email"
        label="Email"
        errorMessage={errors.email?.message}
        register={register}
      />
      <Input
        name="password"
        label="Password"
        errorMessage={errors.password?.message}
        type="password"
        register={register}
      />
      <Button type="submit" className="text-base font-semibold">
        Sign In
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

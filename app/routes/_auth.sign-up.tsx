import { valibotResolver } from "@hookform/resolvers/valibot";
import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSubmit } from "@remix-run/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import siteConfig from "~/site.config";
import { createUserSession, getUserId, signUp } from "~/utils/session.server";
import { SignUpData, SignUpSchema, validateSignUp } from "~/utils/validation";

export const meta: MetaFunction = () => {
  return [
    { title: `Sign Up | ${siteConfig.name}` },
    { name: "description", content: `Sign Up for ${siteConfig.name}` },
  ];
};

type ActionData = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  const formData = await request.formData();
  const body = Object.fromEntries(formData.entries());
  const parseRes = validateSignUp(body);

  if (parseRes.success) {
    const { email, name, password } = parseRes.data;
    const res = await signUp(email, name, password);
    if (res.success) {
      const { user } = res.data;
      return createUserSession(user.id, "/dashboard");
    } else {
      return json({ error: res.error }, { status: 400 });
    }
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function SignUp() {
  const actionData = useActionData<ActionData>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: valibotResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const submit = useSubmit();
  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const onSubmit = (data: SignUpData) => submit(data, { method: "post" });

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto -mt-20 flex w-80 grow flex-col justify-center gap-5"
    >
      <h1 className="text-3xl font-bold">Create an Account!</h1>
      <div className="flex flex-col gap-2">
        <Label>Name</Label>
        <Input placeholder="Name" {...register("name")} />
        <p
          className={cn(
            "hidden text-sm text-destructive",
            errors.name && "block",
          )}
        >
          {errors.name?.message}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Email</Label>
        <Input placeholder="Email" {...register("email")} />
        <p
          className={cn(
            "hidden text-sm text-destructive",
            errors.email && "block",
          )}
        >
          {errors.email?.message}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>Password</Label>
        <Input
          placeholder="Password"
          type="password"
          {...register("password")}
        />
        <p
          className={cn(
            "hidden text-sm text-destructive",
            errors.password && "block",
          )}
        >
          {errors.password?.message}
        </p>
      </div>
      <Button type="submit" className="text-base font-semibold">
        Sign Up
      </Button>
      <Link
        to="/sign-in"
        className="text-center text-sm text-primary underline"
      >
        Already have an account? Sign in instead!
      </Link>
    </Form>
  );
}
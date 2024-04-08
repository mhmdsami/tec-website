import { valibotResolver } from "@hookform/resolvers/valibot";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
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
import { createUserSession, getUserId, signIn } from "~/utils/session.server";
import { SignInData, SignInSchema, validateSignIn } from "~/utils/validation";

export const meta: MetaFunction = () => {
  return [
    { title: `Sign In | ${siteConfig.name}` },
    { name: "description", content: `Sign In into ${siteConfig.name}` },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }

  return null;
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
  const parseRes = validateSignIn(body);

  if (parseRes.success) {
    const { email, password } = parseRes.data;
    const res = await signIn(email, password);
    if (res.success) {
      const { user } = res.data;
      return createUserSession(user.id, "/dashboard");
    } else {
      return json({ error: res.error }, { status: 400 });
    }
  }

  return json({ fieldErrors: parseRes.errors }, { status: 400 });
};

export default function SignIn() {
  const actionData = useActionData<ActionData>();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInData>({
    resolver: valibotResolver(SignInSchema),
    defaultValues: {
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

  const onSubmit = async (data: SignInData) => submit(data, { method: "post" });

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-80 grow flex-col justify-center gap-5"
    >
      <h1 className="text-3xl font-bold">Welcome Back!</h1>
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
        Sign In
      </Button>
      <Link
        to="/sign-up"
        className="text-center text-sm text-primary underline"
      >
        Don't have an account? Create one now!
      </Link>
    </Form>
  );
}

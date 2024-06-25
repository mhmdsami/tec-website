import { valibotResolver } from "@hookform/resolvers/valibot";
import { ActionFunction, json } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import useActionDataWithToast from "~/hooks/use-action-data-with-toast";
import { db } from "~/utils/db.server";
import { ActionResponse } from "~/utils/types";
import { ContactFormSchema, validate } from "~/utils/validation";

export const action: ActionFunction = async ({ request }): ActionResponse => {
  const formData = await request.formData();
  const body = Object.fromEntries(formData);

  const parseRes = validate(body, ContactFormSchema);
  if (!parseRes.success) {
    return json({ fieldErrors: parseRes.errors }, { status: 400 });
  }

  await db.contact.create({
    data: parseRes.data,
  });

  return json({ message: "We will be reaching you shortly!" });
};

export default function Contact() {
  const {
    register,
    formState: { errors },
    reset,
  } = useForm({
    resolver: valibotResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  useActionDataWithToast({
    onMessage: reset,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row">
        <p className="basis-1/2">Address goes here</p>
        <Form
          method="POST"
          className="mx-auto flex w-full grow flex-col justify-center gap-5"
        >
          <h1 className="text-left text-xl font-bold">Contact us</h1>
          <Input
            placeholder="Name"
            name="name"
            register={register}
            errorMessage={errors.name?.message}
          />
          <Input
            placeholder="Email"
            name="email"
            register={register}
            errorMessage={errors.email?.message}
          />
          <Input
            placeholder="Phone"
            name="phone"
            register={register}
            errorMessage={errors.phone?.message}
          />
          <Textarea
            placeholder="Aything that would be helpful to us"
            name="message"
            register={register}
            errorMessage={errors.message?.message}
          />
          <Button type="submit">Enquire</Button>
        </Form>
      </div>
      <iframe
        src={`https://maps.google.com/maps?q=Chennai/&output=embed`}
        style={{ border: 0 }}
        width="100%"
        height="400"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}

import { useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { ActionData } from "~/types";

export default function useActionDataWithDisclosure() {
  const [isOpen, setIsOpen] = useState(false);

  const actionData = useActionData<ActionData>();
  useEffect(() => {
    if (actionData?.message) {
      setIsOpen(false);
    }
  }, [actionData]);

  return { isOpen, setIsOpen, actionData };
}

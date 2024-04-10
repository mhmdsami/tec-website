import { toast } from "react-hot-toast";

export const copyToClipboard = async (text: string, toastMessage?: string) => {
  await navigator.clipboard.writeText(text);

  if (toastMessage) {
    toast.success(toastMessage);
  }
};

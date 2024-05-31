import { Copy } from "lucide-react";
import { Label } from "~/components/ui/label";
import { copyToClipboard } from "~/utils/helpers.client";

export function CopiableInput({
  label,
  value,
}: {
  label?: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <div
        className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:cursor-pointer"
        onClick={() =>
          copyToClipboard(
            value,
            label
              ? `Copied ${label.toLowerCase()} to clipboard`
              : "Copied to clipboard",
          )
        }
      >
        {value}
        <Copy size={20} />
      </div>
    </div>
  );
}

import { CircleCheck, ImagePlus, Loader2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone-esm";

interface ImageUploadProps {
  imageUrl?: string | null;
  onChange: (image: string) => void;
  folder?: string;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ImageUpload({
  imageUrl,
  onChange,
  folder = "",
  isUploading,
  setIsUploading,
}: ImageUploadProps) {
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);

      setIsUploading(true);
      const res = await fetch(`/api/upload?folder=${folder}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }

      setError(data.error);
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  return (
    <>
      <div
        {...getRootProps()}
        className="flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <input
          {...getInputProps({
            accept: "image/*",
            multiple: false,
          })}
        />
        <div className="flex min-h-[160px] grow items-center justify-around gap-2">
          {!imageUrl && !isUploading && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ImagePlus />
              {isDragActive ? (
                <p>drop the files here ...</p>
              ) : (
                <p>
                  drag &amp; drop the file here, or click to select the file
                </p>
              )}
            </div>
          )}
          {isUploading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-primary" />
              Uploading file...
            </div>
          )}
          {imageUrl && (
            <>
              <div className="flex flex-col items-center gap-3">
                <CircleCheck className="text-green-500" />
                File uploaded successfully
              </div>
              <ImageDisplay imageUrl={imageUrl} onRemove={() => onChange("")} />
            </>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
}

interface ImageDisplayProps {
  imageUrl: string;
  onRemove: () => void;
}

function ImageDisplay({ imageUrl, onRemove }: ImageDisplayProps) {
  return (
    <div className="flex flex-col gap-2">
      <img
        src={imageUrl}
        alt="Uploaded"
        className="h-20 w-20 rounded-full object-cover"
      />
      <button
        className="text-sm text-destructive hover:underline"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}

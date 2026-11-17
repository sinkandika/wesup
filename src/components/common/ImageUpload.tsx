"use client";

import { useEffect, useRef, useState } from "react";

type ImageUploadProps = {
  image: File | null;
  onImageChange: (file: File | null) => void;
};

export default function ImageUpload({
  image,
  onImageChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // IMAGE PREVIEW
  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    // Clean up the URL when the image changes or component unmounts.
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function handleFile(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    onImageChange(file);
  }

  // HANDLE DROP
  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    handleFile(file ?? null);
  }

  return (
    <div className="text-color-8">
      <label className="text-sm font-medium">
        Profile image
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-1 cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? "border-color-4 bg-color-5"
            : "border-color-6 hover:border-color-4"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0] ?? null);

            // Allow selecting the same file again.
            event.target.value = "";
          }}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewUrl}
              alt="Profile preview"
              className="h-24 w-24 rounded-full object-cover"
            />

            <p className="break-all text-sm font-medium text-gray-700">
              {image?.name}
            </p>

            <p className="text-xs text-gray-500">
              Click to replace image
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
              aria-hidden="true"
            >
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
            </svg>

            <p className="text-sm font-medium text-gray-700">
              Drag and drop your image here
            </p>

            <p className="text-sm text-gray-500">
              or click to browse files
            </p>

            <p className="text-xs text-gray-400">
              PNG, JPG, or WEBP
            </p>
          </div>
        )}
      </div>

      {image && (
        <button
          type="button"
          onClick={() => onImageChange(null)}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          Remove image
        </button>
      )}
    </div>
  );
}
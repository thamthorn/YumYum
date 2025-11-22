"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImage {
  id?: string;
  url: string;
  displayOrder: number;
  file?: File;
}

interface ProductImageUploaderProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
  // ...existing code...
  disabled?: boolean;
}

export function ProductImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  // ...existing code...
  disabled = false,
}: ProductImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newImages: ProductImage[] = filesToAdd.map((file, index) => ({
      url: URL.createObjectURL(file),
      displayOrder: images.length + index + 1,
      file,
    }));

    onImagesChange([...images, ...newImages]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reordered = updated.map((img, i) => ({
      ...img,
      displayOrder: i + 1,
    }));
    onImagesChange(reordered);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;

    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Reorder
    const reordered = updated.map((img, i) => ({
      ...img,
      displayOrder: i + 1,
    }));
    onImagesChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
            isDragging && "border-green-500 bg-green-50",
            !isDragging && "border-gray-300 hover:border-gray-400",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-700">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, WEBP up to 5MB ({images.length}/{maxImages})
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={disabled}
          />
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={`${image.id || index}-${image.displayOrder}`}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
            >
              <Image
                src={image.url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Display Order Badge */}
              <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white backdrop-blur-sm">
                {image.displayOrder}
              </div>

              {/* Action Buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {/* Move Left */}
                <button
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0 || disabled}
                  className="rounded-lg bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Move left"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Remove */}
                <button
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Remove image"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Move Right */}
                <button
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === images.length - 1 || disabled}
                  className="rounded-lg bg-white p-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Move right"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 rounded-lg bg-green-500 px-2 py-1 text-xs font-semibold text-white">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500">
          💡 First image will be the primary product image. Drag to reorder or
          click arrows.
        </p>
      )}
    </div>
  );
}

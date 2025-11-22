"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface MediaFile {
  id?: string;
  url: string;
  title: string;
  description?: string;
  fileType: "FACTORY_TOUR" | "QC_PROCESS";
  file?: File;
}

interface MediaUploaderProps {
  media: MediaFile[];
  onMediaChange: (media: MediaFile[]) => void;
  maxVideos?: number;
  disabled?: boolean;
}

export function MediaUploader({
  media,
  onMediaChange,
  maxVideos = 3,
  disabled = false,
}: MediaUploaderProps) {
  // ...existing code...
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Create temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    const newMedia: MediaFile = {
      url: tempUrl,
      title: "",
      description: "",
      fileType: "FACTORY_TOUR",
      file,
    };

    onMediaChange([...media, newMedia]);
  };

  const updateMedia = (index: number, updates: Partial<MediaFile>) => {
    const updated = [...media];
    updated[index] = { ...updated[index], ...updates };
    onMediaChange(updated);
  };

  const removeMedia = (index: number) => {
    const updated = media.filter((_, i) => i !== index);
    onMediaChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload Button */}
      {media.length < maxVideos && (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors",
              disabled
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : "border-green-300 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100"
            )}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium">
              Upload Video ({media.length}/{maxVideos})
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            disabled={disabled}
          />

          <p className="mt-2 text-xs text-gray-500">
            MP4, WEBM, OGG up to 100MB. Recommended: 1080p, 16:9 ratio, max 2
            minutes
          </p>
        </div>
      )}

      {/* Media List */}
      {media.length > 0 && (
        <div className="space-y-4">
          {media.map((item, index) => (
            <div
              key={`${item.id || index}-${item.url}`}
              className="rounded-xl border bg-white p-6"
            >
              <div className="flex items-start gap-4">
                {/* Video Preview */}
                <div className="relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg
                      className="h-12 w-12 text-white opacity-80"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-3">
                  {/* Title */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        updateMedia(index, { title: e.target.value })
                      }
                      placeholder="e.g., Factory Tour - Production Line"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      disabled={disabled}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Video Type *
                    </label>
                    <select
                      value={item.fileType}
                      onChange={(e) =>
                        updateMedia(index, {
                          fileType: e.target.value as
                            | "FACTORY_TOUR"
                            | "QC_PROCESS",
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      disabled={disabled}
                    >
                      <option value="FACTORY_TOUR">Factory Tour</option>
                      <option value="QC_PROCESS">
                        Quality Control Process
                      </option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      value={item.description || ""}
                      onChange={(e) =>
                        updateMedia(index, { description: e.target.value })
                      }
                      placeholder="Brief description of what's shown in the video..."
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                      disabled={disabled}
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeMedia(index)}
                  disabled={disabled}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Remove video"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tier Warning */}
      {!disabled && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-medium">Verified Partner Feature</p>
              <p className="mt-1 text-green-700">
                Upload factory tour and QC process videos to showcase your
                facilities to potential buyers. Only available for Verified
                Partner tier.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MediaGalleryProps {
  media: MediaFile[];
  className?: string;
}

export function MediaGallery({ media, className }: MediaGalleryProps) {
  if (media.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900">Factory Media</h3>

      <div className="grid gap-6 md:grid-cols-2">
        {media.map((item, index) => (
          <div
            key={`${item.id || index}`}
            className="rounded-xl border bg-white p-4"
          >
            <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
              <video
                src={item.url}
                controls
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <span className="flex-shrink-0 rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  {item.fileType === "FACTORY_TOUR"
                    ? "Factory Tour"
                    : "QC Process"}
                </span>
              </div>
              {item.description && (
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

function compressImage(file: File, maxPx = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxPx) {
        height = Math.round((height * maxPx) / width);
        width = maxPx;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.src = objectUrl;
  });
}

type Status = "idle" | "compressing" | "uploading";

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError("");
    try {
      setStatus("compressing");
      const compressed = await compressImage(file);

      setStatus("uploading");
      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(String(err));
    } finally {
      setStatus("idle");
    }
  }

  const busy = status !== "idle";
  const label = status === "compressing" ? "Compressing..." : status === "uploading" ? "Uploading..." : value ? "Change image" : "Choose image";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-cBlack">Thumbnail</label>
      <div className="flex gap-3 items-start">
        {value && (
          <div className="relative w-24 h-16 bg-zinc-100 shrink-0 overflow-hidden">
            <Image src={value} alt="Thumbnail preview" fill className="object-cover" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-sm border border-zinc-300 px-3 py-1.5 text-zinc-600 hover:border-cBlack hover:text-cBlack transition-colors disabled:opacity-50"
          >
            {label}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-500 hover:text-red-700 block"
            >
              Remove
            </button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

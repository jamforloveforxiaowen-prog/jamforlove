"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewWidth?: number;
  previewHeight?: number;
}

export default function ImageUploader({
  value,
  onChange,
  label = "圖片",
  previewWidth = 80,
  previewHeight = 80,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("上傳失敗，請重試");
    }

    setUploading(false);
    // 清除 input 讓同一檔案可以重新選
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-espresso mb-2">{label}</label>
      <div className="flex items-center gap-4">
        {/* 預覽 */}
        {value ? (
          <Image
            src={value}
            alt="預覽"
            width={previewWidth}
            height={previewHeight}
            className="rounded-md object-cover ring-1 ring-linen-dark/60"
            style={{ width: previewWidth, height: previewHeight }}
            unoptimized={value.startsWith("data:")}
          />
        ) : (
          <div
            className="rounded-md bg-linen-dark/30 flex items-center justify-center text-espresso-light/30 text-sm"
            style={{ width: previewWidth, height: previewHeight }}
          >
            無圖片
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs px-3 py-2 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all disabled:opacity-40"
          >
            {uploading ? "上傳中..." : value ? "更換圖片" : "選擇圖片"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-rose/60 hover:text-rose transition-colors"
            >
              移除圖片
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      {error && <p className="text-rose text-xs mt-2">{error}</p>}
      <p className="text-espresso-light/30 text-xs mt-1">支援 JPG、PNG、WebP、GIF，最大 10MB</p>
    </div>
  );
}

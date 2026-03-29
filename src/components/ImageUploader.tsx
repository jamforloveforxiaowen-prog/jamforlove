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

// 前端壓縮圖片到目標大小（預設 800KB 以內）
function compressImage(file: File, maxSizeKB = 800, maxDim = 1600): Promise<File> {
  return new Promise((resolve) => {
    // 如果檔案已經夠小，直接回傳
    if (file.size <= maxSizeKB * 1024) {
      resolve(file);
      return;
    }

    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      // 計算縮放尺寸
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      // 逐步降低品質直到小於目標大小
      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= maxSizeKB * 1024 || quality <= 0.3) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          "image/jpeg",
          quality
        );
      };
      tryCompress();
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
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

    // 前端先壓縮
    const compressed = await compressImage(file);

    const formData = new FormData();
    formData.append("file", compressed);

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
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-espresso mb-2">{label}</label>
      <div className="flex items-center gap-4">
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
            {uploading ? "壓縮上傳中..." : value ? "更換圖片" : "選擇圖片"}
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
      <p className="text-espresso-light/30 text-xs mt-1">支援 JPG、PNG、WebP、GIF，大圖會自動壓縮</p>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  previewWidth?: number;
  previewHeight?: number;
  /** 指定目標裁切尺寸（例如 banner: 1920x823） */
  targetWidth?: number;
  targetHeight?: number;
}

// 前端自動調整圖片尺寸，確保不超過 Vercel 4.5MB 限制
// targetWidth/targetHeight 可指定目標尺寸（例如 banner 21:9）
function processImage(
  file: File,
  options: { maxSizeKB?: number; maxDim?: number; targetWidth?: number; targetHeight?: number } = {}
): Promise<File> {
  const { maxSizeKB = 1500, maxDim = 1920, targetWidth, targetHeight } = options;

  return new Promise((resolve) => {
    // 小於限制且沒有指定目標尺寸，直接回傳
    if (file.size <= maxSizeKB * 1024 && !targetWidth) {
      resolve(file);
      return;
    }

    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);

      let canvasW: number;
      let canvasH: number;

      if (targetWidth && targetHeight) {
        // Banner 模式：裁切為指定比例，cover 填滿
        canvasW = targetWidth;
        canvasH = targetHeight;
      } else {
        // 一般模式：等比縮放
        canvasW = img.width;
        canvasH = img.height;
        if (canvasW > maxDim || canvasH > maxDim) {
          const ratio = Math.min(maxDim / canvasW, maxDim / canvasH);
          canvasW = Math.round(canvasW * ratio);
          canvasH = Math.round(canvasH * ratio);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d")!;

      if (targetWidth && targetHeight) {
        // Cover 裁切：計算來源裁切區域
        const srcRatio = img.width / img.height;
        const dstRatio = canvasW / canvasH;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcRatio > dstRatio) {
          sw = img.height * dstRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / dstRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
      } else {
        ctx.drawImage(img, 0, 0, canvasW, canvasH);
      }

      // 高品質輸出，逐步降低品質到目標大小
      let quality = 0.92;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size <= maxSizeKB * 1024 || quality <= 0.4) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              quality -= 0.08;
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
  targetWidth,
  targetHeight,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    // 前端先處理圖片（調整尺寸）
    const compressed = await processImage(file, { targetWidth, targetHeight });

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

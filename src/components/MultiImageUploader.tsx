"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
  previewWidth?: number;
  previewHeight?: number;
}

function processImage(file: File, maxSizeKB = 1500, maxDim = 1920): Promise<File> {
  return new Promise((resolve) => {
    if (file.size <= maxSizeKB * 1024) {
      resolve(file);
      return;
    }
    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
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

export default function MultiImageUploader({
  value,
  onChange,
  label = "活動說明圖（選填，最多 5 張）",
  maxImages = 5,
  previewWidth = 120,
  previewHeight = 80,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      setError(`最多只能上傳 ${maxImages} 張圖片`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setError("");
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of filesToUpload) {
      const compressed = await processImage(file);
      const formData = new FormData();
      formData.append("file", compressed);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
        } else {
          setError(data.error || "Upload failed");
        }
      } catch {
        setError("上傳失敗，請重試");
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-espresso mb-2">{label}</label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {value.map((url, i) => (
            <div key={`${url}-${i}`} className="relative group">
              <Image
                src={url}
                alt={`說明圖 ${i + 1}`}
                width={previewWidth}
                height={previewHeight}
                className="rounded-md object-cover ring-1 ring-linen-dark/60"
                style={{ width: previewWidth, height: previewHeight }}
              />
              {/* 操作按鈕 */}
              <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="w-6 h-6 rounded-full bg-white/90 text-espresso flex items-center justify-center text-xs hover:bg-white"
                    title="左移"
                  >
                    &larr;
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-6 h-6 rounded-full bg-rose/90 text-white flex items-center justify-center text-xs hover:bg-rose"
                  title="刪除"
                >
                  &times;
                </button>
                {i < value.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="w-6 h-6 rounded-full bg-white/90 text-espresso flex items-center justify-center text-xs hover:bg-white"
                    title="右移"
                  >
                    &rarr;
                  </button>
                )}
              </div>
              {/* 序號 */}
              <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-espresso/70 text-white text-[0.6rem] flex items-center justify-center font-bold">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || value.length >= maxImages}
          className="text-xs px-3 py-2 rounded-md ring-1 ring-linen-dark text-espresso-light hover:text-espresso hover:ring-espresso-light transition-all disabled:opacity-40"
        >
          {uploading ? "壓縮上傳中..." : value.length >= maxImages ? `已達上限 ${maxImages} 張` : "+ 新增圖片"}
        </button>
        <span className="text-xs text-espresso-light/40">
          {value.length} / {maxImages} 張
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFiles}
        multiple
        className="hidden"
      />

      {error && <p className="text-rose text-xs mt-2">{error}</p>}
      <p className="text-espresso-light/30 text-xs mt-1">支援 JPG、PNG、WebP、GIF，大圖會自動壓縮。可拖曳排序。</p>
    </div>
  );
}

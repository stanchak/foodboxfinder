"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploaderProps {
  name: string;
  label: string;
  currentUrl?: string | null;
  directory: string; // e.g. "assets/providers/heroes"
  filenamePrefix: string; // e.g. "hellofresh" — extension appended from file
  helpText?: string;
}

export default function ImageUploader({
  name,
  label,
  currentUrl,
  directory,
  filenamePrefix,
  helpText,
}: Readonly<ImageUploaderProps>) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [savedPath, setSavedPath] = useState<string>(currentUrl ?? "");
  const [remoteUrl, setRemoteUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${filenamePrefix}.${ext}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", directory);
    formData.append("filename", filename);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setSavedPath(data.path);
        setPreview(data.path + "?t=" + Date.now());
        setError(null);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed — network error");
    } finally {
      setUploading(false);
    }
  }, [directory, filenamePrefix]);

  const downloadRemote = useCallback(async () => {
    if (!remoteUrl.trim()) return;
    setUploading(true);
    setError(null);

    // Guess extension from URL or default to jpg
    const urlPath = new URL(remoteUrl).pathname;
    const ext = urlPath.split(".").pop()?.toLowerCase();
    const safeExt = ext && ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext) ? ext : "jpg";
    const filename = `${filenamePrefix}.${safeExt}`;

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: remoteUrl, directory, filename }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedPath(data.path);
        setPreview(data.path + "?t=" + Date.now());
        setRemoteUrl("");
        setError(null);
      } else {
        setError(data.error ?? "Download failed");
      }
    } catch {
      setError("Download failed — network error");
    } finally {
      setUploading(false);
    }
  }, [remoteUrl, directory, filenamePrefix]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    } else {
      setError("Please drop an image file");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">{label}</label>

      {/* Hidden input for form submission — stores the final saved path */}
      <input type="hidden" name={name} value={savedPath} />

      {/* Preview */}
      {preview && (
        <div className="relative w-full max-w-xs rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-contain"
          />
          <button
            type="button"
            onClick={() => { setPreview(null); setSavedPath(""); }}
            className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-neutral-500 hover:text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-primary-400 bg-primary-50"
            : "border-neutral-300 hover:border-neutral-400 bg-white"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <svg className="mx-auto w-8 h-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-neutral-600">
          {uploading ? "Uploading..." : "Drop an image here or click to browse"}
        </p>
        <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP, GIF, SVG</p>
      </div>

      {/* Remote URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={remoteUrl}
          onChange={(e) => setRemoteUrl(e.target.value)}
          placeholder="Or paste a remote image URL..."
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <button
          type="button"
          onClick={downloadRemote}
          disabled={!remoteUrl.trim() || uploading}
          className="rounded-lg bg-neutral-800 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? "..." : "Pull"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}
    </div>
  );
}

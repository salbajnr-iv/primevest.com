"use client";

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UploadedDoc {
  storage_path: string;
  file_name: string;
  mime_type?: string | null;
  size?: number | null;
  doc_type: string;
}

interface EnhancedKycUploaderProps {
  userId: string;
  docType: string;
  docLabel: string;
  onUploaded: (docs: UploadedDoc[]) => void;
  maxFiles?: number;
}

export default function EnhancedKycUploader({
  userId,
  docType,
  docLabel,
  onUploaded,
  maxFiles = 3,
}: EnhancedKycUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Generate previews
  React.useEffect(() => {
    const newPreviews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [files]);

  const validateFiles = (selectedFiles: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    const valid = selectedFiles.filter((f) => {
      if (!validTypes.includes(f.type)) {
        errors.push(`${f.name}: Invalid file type. Accepted: JPG, PNG, WebP, PDF`);
        return false;
      }
      if (f.size > maxSize) {
        errors.push(`${f.name}: File too large. Max 15MB`);
        return false;
      }
      return true;
    });

    if (files.length + valid.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    return { valid, errors };
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    setError(undefined);

    const arr = Array.from(selectedFiles);
    const { valid, errors } = validateFiles(arr);

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setFiles((prev) => [...prev.slice(0, maxFiles - 1), ...valid]);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAll = async () => {
    if (!files.length) return;

    setUploading(true);
    setError(undefined);

    const uploaded: UploadedDoc[] = [];

    try {
      for (const f of files) {
        const path = `user-${userId}/${Date.now()}-${f.name}`;
        const bucket = 'kyc-documents';

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, f);

        if (upErr) {
          console.error('Upload error', upErr);
          setError(`Failed to upload ${f.name}`);
          continue;
        }

        uploaded.push({
          storage_path: path,
          file_name: f.name,
          mime_type: f.type,
          size: f.size,
          doc_type: docType,
        });
      }

      if (uploaded.length > 0) {
        onUploaded(uploaded);
        setFiles([]);
        setPreviews([]);
      }
    } catch (e) {
      console.error('Upload exception', e);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-green-500 bg-green-950/30'
            : 'border-gray-600 hover:border-green-500 hover:bg-gray-800/50 bg-gray-800/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
        />

        <div className="space-y-2">
          <div className="text-4xl">📄</div>
          <h3 className="text-lg font-semibold text-white">{docLabel}</h3>
          <p className="text-sm text-gray-400">
            Drag and drop your files here or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Accepted: JPG, PNG, WebP, PDF. Max 15MB per file
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-950/50 border border-red-600 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300">
            Selected Files ({previews.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                {preview.file.type.startsWith('image/') ? (
                  <img
                    src={preview.url}
                    alt={`preview-${index}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-600"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                )}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removeFile(index)}
                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {preview.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={uploadAll}
          disabled={uploading}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`
          )}
        </button>
      )}
    </div>
  );
}

"use client";

import React from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadedDoc {
  storage_path: string
  file_name: string
  mime_type?: string | null
  size?: number | null
  doc_type: string
}

export default function KycUploader({ userId, onUploaded }: { userId: string, onUploaded: (docs: UploadedDoc[]) => void }) {
  const [files, setFiles] = React.useState<File[]>([])
  const [uploading, setUploading] = React.useState(false)
  const [previews, setPreviews] = React.useState<string[]>([])

  React.useEffect(() => {
    // generate previews
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(u => URL.revokeObjectURL(u))
  }, [files])

  async function handleFiles(selected: FileList | null) {
    if (!selected) return
    const arr = Array.from(selected)
    // Basic validation
    const accepted = arr.filter(f => {
      const okType = ['image/jpeg','image/png','application/pdf'].includes(f.type)
      const okSize = f.size <= 10 * 1024 * 1024 // 10MB
      return okType && okSize
    })
    setFiles(accepted)
  }

  async function uploadAll(docType = 'id_card') {
    if (!files.length) return
    setUploading(true)
    const supabase = createClient()
    const uploaded: UploadedDoc[] = []

    for (const f of files) {
      const path = `user-${userId}/${Date.now()}-${f.name}`
      const bucket = 'kyc-documents'
      try {
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, f)
        if (upErr) {
          console.error('Upload error', upErr)
          continue
        }
        uploaded.push({ storage_path: path, file_name: f.name, mime_type: f.type, size: f.size, doc_type: docType })
      } catch (e) {
        console.error('Upload exception', e)
      }
    }

    onUploaded(uploaded)
    setUploading(false)
    setFiles([])
  }

  return (
    <div className="kyc-uploader">
      <div className="mb-2">
        <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} accept="image/*,application/pdf" />
      </div>

      {previews.length > 0 && (
        <div className="flex gap-2 mb-2">
          {previews.map((p, i) => (
            <img key={i} src={p} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded-md" />
          ))}
        </div>
      )}

      <div>
        <button onClick={() => uploadAll('id_card')} disabled={uploading || files.length === 0} className="px-4 py-2 bg-green-800 text-white rounded-lg">{uploading ? 'Uploading...' : 'Upload & Attach'}</button>
      </div>
    </div>
  )
}

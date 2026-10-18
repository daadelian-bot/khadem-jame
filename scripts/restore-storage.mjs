import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'

const url = process.env.RESTORE_SUPABASE_URL
const key = process.env.RESTORE_SUPABASE_SERVICE_ROLE_KEY
const backupDir = process.argv[2]
if (!url || !key || !backupDir) {
  console.error('Usage: RESTORE_SUPABASE_URL=... RESTORE_SUPABASE_SERVICE_ROLE_KEY=... node scripts/restore-storage.mjs <backup-directory>')
  process.exit(2)
}
const manifestPath = path.join(backupDir, 'storage-manifest.json')
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
const { data: existing, error: listError } = await supabase.storage.listBuckets()
if (listError) throw new Error(`Unable to list target buckets: ${listError.message}`)
const existingNames = new Set((existing || []).map(b => b.name))
let restored = 0

for (const bucket of manifest.buckets || []) {
  if (!existingNames.has(bucket.name)) {
    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: Boolean(bucket.public),
      ...(bucket.file_size_limit != null ? { fileSizeLimit: bucket.file_size_limit } : {}),
      ...(bucket.allowed_mime_types != null ? { allowedMimeTypes: bucket.allowed_mime_types } : {})
    })
    if (error) throw new Error(`Create bucket ${bucket.name} failed: ${error.message}`)
    console.log(`Created bucket ${bucket.name}`)
  }
  for (const object of bucket.objects || []) {
    const source = path.join(backupDir, 'objects', bucket.name, ...object.path.split('/'))
    const bytes = await fs.readFile(source)
    const options = {
      upsert: true,
      ...(object.metadata?.mimetype ? { contentType: object.metadata.mimetype } : {}),
      ...(object.metadata?.cacheControl ? { cacheControl: String(object.metadata.cacheControl) } : {})
    }
    const { error } = await supabase.storage.from(bucket.name).upload(object.path, bytes, options)
    if (error) throw new Error(`Upload failed for ${bucket.name}/${object.path}: ${error.message}`)
    restored++
  }
  console.log(`Restored bucket ${bucket.name}`)
}
console.log(`Storage restore uploaded ${restored} objects.`)
console.log('Important: Storage RLS policies and application-level permissions must be recreated/reviewed separately. Verify sample images and attachments before switching the app.')

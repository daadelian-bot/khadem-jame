import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const outDir = process.env.STORAGE_BACKUP_DIR || path.join('backups', 'storage-' + new Date().toISOString().replace(/[:.]/g, '-'))
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local shell. Never put the service key in Git or the APK.')
  process.exit(2)
}
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
await fs.mkdir(outDir, { recursive: true, mode: 0o700 })

async function listFiles(bucket, prefix = '') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
  if (error) throw new Error(`List failed for ${bucket}/${prefix}: ${error.message}`)
  const found = []
  for (const item of data || []) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id == null && item.metadata == null) {
      found.push(...await listFiles(bucket, fullPath))
    } else {
      found.push({ path: fullPath, metadata: item.metadata || null, id: item.id || null, updated_at: item.updated_at || null, created_at: item.created_at || null })
    }
  }
  return found
}

const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
if (bucketError) throw new Error(`Unable to list buckets: ${bucketError.message}`)
const manifest = { created_at: new Date().toISOString(), source_url: url, buckets: [] }
let total = 0
for (const bucket of buckets) {
  const entry = {
    name: bucket.name,
    public: bucket.public,
    file_size_limit: bucket.file_size_limit ?? null,
    allowed_mime_types: bucket.allowed_mime_types ?? null,
    objects: []
  }
  const files = await listFiles(bucket.name)
  console.log(`Backing up bucket ${bucket.name}: ${files.length} objects`)
  for (const file of files) {
    const { data, error } = await supabase.storage.from(bucket.name).download(file.path)
    if (error) throw new Error(`Download failed for ${bucket.name}/${file.path}: ${error.message}`)
    const dest = path.join(outDir, 'objects', bucket.name, ...file.path.split('/'))
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.writeFile(dest, Buffer.from(await data.arrayBuffer()))
    entry.objects.push(file)
    total++
  }
  manifest.buckets.push(entry)
}
await fs.writeFile(path.join(outDir, 'storage-manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600 })
console.log(`Storage export complete: ${total} objects in ${manifest.buckets.length} buckets.`)
console.log(`Output: ${outDir}`)
console.log('Keep this directory private; object names and file contents may contain personal information.')

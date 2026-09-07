import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada file yang diunggah' })
  }

  const file = files[0]
  if (!file.filename || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'Data file tidak valid' })
  }

  // Validate mime type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif']
  if (file.type && !allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipe file harus berupa gambar (JPG, PNG, WEBP, GIF)' })
  }

  const ext = path.extname(file.filename) || '.jpg'
  const randomName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
  
  const uploadDir = path.resolve(process.cwd(), 'public/uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const filePath = path.join(uploadDir, randomName)
  fs.writeFileSync(filePath, file.data)

  const publicUrl = `/uploads/${randomName}`

  return {
    success: true,
    url: publicUrl,
    filename: randomName
  }
})

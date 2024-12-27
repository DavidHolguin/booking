export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Upload failed: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error)
    throw error
  }
}


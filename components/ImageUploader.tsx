import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/ui/use-toast'

interface ImageUploaderProps {
  onImageUpload: (url: string) => void
  label: string
  currentImage?: string
}

export default function ImageUploader({ onImageUpload, label, currentImage }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json();
      } else {
        // If the response is not JSON, read it as text
        const text = await response.text();
        throw new Error(`Server responded with non-JSON data: ${text}`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Upload failed')
      }

      if (!responseData.secure_url) {
        throw new Error('No secure URL returned from the server')
      }

      onImageUpload(responseData.secure_url)
      toast({
        title: 'Éxito',
        description: 'Imagen cargada correctamente',
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo cargar la imagen. Por favor, intente de nuevo.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label htmlFor={`image-upload-${label}`}>{label}</Label>
      <div className="flex items-center space-x-4">
        {currentImage && (
          <Image
            src={currentImage}
            alt={label}
            width={100}
            height={100}
            className="rounded-md object-cover"
          />
        )}
        <div className="flex-1">
          <Input
            id={`image-upload-${label}`}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            className="hidden"
          />
          <Label
            htmlFor={`image-upload-${label}`}
            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir imagen
              </>
            )}
          </Label>
        </div>
      </div>
    </div>
  )
}


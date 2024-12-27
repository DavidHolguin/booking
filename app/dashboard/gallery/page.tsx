'use client'

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Grid, ImageIcon, Upload, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';

interface CloudinaryImage {
  id: string;
  url: string;
  public_id: string;
  image_type: 'logo' | 'cover' | 'gallery';
}

interface GalleryProps {
  hotelId: string | undefined;
  initialImages?: CloudinaryImage[];
  onImagesUpdate?: (images: CloudinaryImage[]) => void;
  maxImages?: number;
  allowedTypes?: string[];
}

export default function Gallery({
  hotelId,
  initialImages = [],
  onImagesUpdate,
  maxImages = 20,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: GalleryProps) {
  const [currentView, setCurrentView] = useState<'carousel' | 'grid'>('carousel');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [images, setImages] = useState<CloudinaryImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imagesPerPage = 6;
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    if (hotelId) {
      fetchImages();
    }
  }, [hotelId]);

  const fetchImages = async () => {
    if (!hotelId) {
      console.warn('Hotel ID is undefined. Cannot fetch images.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hotel_images')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('image_type', 'gallery')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las imágenes.',
          variant: 'destructive',
        });
        return;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las imágenes.',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'Error',
        description: `Se pueden subir un máximo de ${maxImages} imágenes.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const uploadedUrl = await uploadToCloudinary(file);

        if (uploadedUrl) {
          const { data, error } = await supabase
            .from('hotel_images')
            .insert({
              hotel_id: hotelId,
              url: uploadedUrl,
              public_id: uploadedUrl.split('/').pop()?.split('.')[0] || '',
              image_type: 'gallery',
            })
            .select()
            .single();

          if (error) {
            console.error('Error saving image URL to Supabase:', error);
            toast({
              title: 'Error',
              description: 'No se pudo guardar la imagen en la base de datos.',
              variant: 'destructive',
            });
          } else {
            setImages((prevImages) => [...prevImages, data]);
            onImagesUpdate?.([...images, data]);
          }
        }
      }

      toast({
        title: 'Éxito',
        description: 'Imágenes subidas correctamente.',
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Error al subir las imágenes.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('hotel_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(images.filter((image) => image.id !== imageId));
      onImagesUpdate?.(images.filter((image) => image.id !== imageId));

      toast({
        title: 'Éxito',
        description: 'Imagen eliminada correctamente.',
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la imagen.',
        variant: 'destructive',
      });
    }
  };


  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const paginatedImages = images.slice(
    (page - 1) * imagesPerPage,
    page * imagesPerPage
  );

  if (!hotelId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <input
            type="file"
            id="image-upload"
            accept={allowedTypes.join(',')}
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading || images.length >= maxImages}
          />
          <label htmlFor="image-upload">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isUploading || images.length >= maxImages}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...{uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Imágenes
                </>
              )}
            </Button>
          </label>
          <span className="text-sm text-muted-foreground">
            {images.length} / {maxImages} imágenes
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentView(currentView === 'carousel' ? 'grid' : 'carousel')
          }
        >
          {currentView === 'carousel' ? (
            <Grid className="h-4 w-4" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No se han subido imágenes aún</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {currentView === 'carousel' ? (
            <motion.div
              key="carousel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative aspect-video bg-muted rounded-lg overflow-hidden"
            >
              {images[currentIndex] && (
                <>
                  <Image
                    src={images[currentIndex].url}
                    alt={`Imagen ${currentIndex + 1}`}
                    fill
                    objectFit="cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                    <span className="text-sm">
                      {currentIndex + 1} / {images.length}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(images[currentIndex].id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}

              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-4 transform -translate-y-1/2"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-4 transform -translate-y-1/2"
                onClick={handleNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              {paginatedImages.map((image, index) => (
                <div key={image.id} className="relative aspect-video group">
                  <Image
                    src={image.url}
                    alt={`Imagen ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {currentView === 'grid' && totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}


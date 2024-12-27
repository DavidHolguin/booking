'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Grid, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GalleryProps {
  images: string[]
}

export default function Gallery({ images }: GalleryProps) {
  const [currentView, setCurrentView] = useState<'carousel' | 'grid'>('carousel')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [page, setPage] = useState(1)

  const imagesPerPage = 6
  const totalPages = Math.ceil(images.length / imagesPerPage)

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const paginatedImages = images.slice((page - 1) * imagesPerPage, page * imagesPerPage)

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentView(currentView === 'carousel' ? 'grid' : 'carousel')}
        >
          {currentView === 'carousel' ? <Grid className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {currentView === 'carousel' ? (
          <motion.div
            key="carousel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative aspect-video"
          >
            <Image
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
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
              <div key={index} className="relative aspect-video">
                <Image
                  src={image}
                  alt={`Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {currentView === 'grid' && totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}


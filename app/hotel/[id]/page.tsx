'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Star, MapPin, Phone, Mail, Globe, Home, Calendar, Info, ImageIcon, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import BookingEngine from '@/components/BookingEngine'
import AIChat from '@/components/AIChat'
import AuthModal from '@/components/AuthModal'
import BottomNav from '@/components/BottomNav'
import { useTheme } from 'next-themes'
import RoomTypes from '@/components/RoomTypes'
import Gallery from '@/components/Gallery'
import Reviews from '@/components/Reviews'

interface Hotel {
  id: string
  name: string
  description: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  website: string
  check_in_time: string
  check_out_time: string
  amenities: string[]
  logo_url: string | null
  cover_url: string | null
  gallery_urls: string[]
  chatbot_enabled: boolean
  rating: number
}

const defaultHotel: Hotel = {
  id: '',
  name: 'Hotel Example',
  description: 'A luxurious stay awaits you in the heart of the city.',
  address: '123 Main St',
  city: 'Exampleville',
  country: 'Sampleland',
  phone: '+1 234 567 8900',
  email: 'info@hotelexample.com',
  website: 'https://www.hotelexample.com',
  check_in_time: '15:00',
  check_out_time: '11:00',
  amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Parking'],
  logo_url: '/placeholder-logo.png',
  cover_url: '/placeholder-cover.jpg',
  gallery_urls: [
    '/placeholder-room1.jpg',
    '/placeholder-room2.jpg',
    '/placeholder-restaurant.jpg',
    '/placeholder-pool.jpg',
  ],
  chatbot_enabled: true,
  rating: 4.5,
}

export default function HotelPublicProfilePage() {
  const [hotel, setHotel] = useState<Hotel>(defaultHotel)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const params = useParams()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetchHotel()
  }, [])

  async function fetchHotel() {
    if (params.id) {
      try {
        const { data, error } = await supabase
          .from('hotels')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (error) throw error

        setHotel({
          ...defaultHotel,
          ...data,
          amenities: data.amenities || [],
          gallery_urls: data.gallery_urls || [],
          chatbot_enabled: data.chatbot_enabled || false,
        })
      } catch (error) {
        console.error('Error fetching hotel:', error)
        setError('No se pudo cargar la información del hotel.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="pb-16">
      <header className="relative h-[60vh] mb-8">
        <Image
          src={hotel.cover_url || '/placeholder-cover.jpg'}
          alt={`Portada de ${hotel.name}`}
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={hotel.logo_url || '/placeholder-logo.png'}
              alt={`Logo de ${hotel.name}`}
              width={120}
              height={120}
              className="rounded-full mb-4 border-4 border-white shadow-lg"
            />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {hotel.name}
          </motion.h1>
          <motion.div
            className="flex items-center space-x-4 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-1" />
              <span>{hotel.city}, {hotel.country}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-1 text-yellow-400" />
              <span>{hotel.rating} (128 reseñas)</span>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Sobre {hotel.name}</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-lg">{hotel.description}</p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Habitaciones</h2>
          <RoomTypes hotelId={hotel.id} onBookingClick={() => setIsBookingModalOpen(true)} />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Galería</h2>
          <Gallery images={hotel.gallery_urls} />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Reseñas</h2>
          <Reviews hotelId={hotel.id} />
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Ubicación e Información de Contacto</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Dirección</h3>
                  <p>{hotel.address}</p>
                  <p>{hotel.city}, {hotel.country}</p>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">Contacto</h3>
                    <p className="flex items-center"><Phone className="w-5 h-5 mr-2" /> {hotel.phone}</p>
                    <p className="flex items-center"><Mail className="w-5 h-5 mr-2" /> {hotel.email}</p>
                    <p className="flex items-center"><Globe className="w-5 h-5 mr-2" /> {hotel.website}</p>
                  </div>
                </div>
                <div className="h-64 md:h-full relative">
                  <Image
                    src="/placeholder-map.jpg"
                    alt="Mapa de ubicación"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      <BottomNav 
        onAuthClick={() => setIsAuthModalOpen(true)}
        onBookingClick={() => setIsBookingModalOpen(true)}
      />

      {hotel.chatbot_enabled && (
        <AIChat hotelId={hotel.id} />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        hotelLogo={hotel.logo_url || '/placeholder-logo.png'} 
      />
      
      <AnimatePresence>
        {isBookingModalOpen && (
          <BookingEngine
            hotelId={hotel.id}
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}


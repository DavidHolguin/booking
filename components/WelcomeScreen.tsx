import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe, Bot, BarChart3, Calendar } from 'lucide-react'

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Icon className="w-6 h-6 text-primary" />
        <span>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p>{description}</p>
    </CardContent>
  </Card>
)

const WelcomeScreen = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card text-card-foreground rounded-lg shadow-lg max-w-4xl w-full overflow-y-auto max-h-[90vh]"
      >
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold text-center mb-8">Bienvenido a la Revolución en Gestión Hotelera</h1>
          
          <p className="text-lg text-center mb-8">
            Descubre el poder de nuestro innovador motor de reservas multicanal potenciado por IA.
            Simplifica tu gestión, aumenta tus ingresos y deleita a tus huéspedes como nunca antes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <FeatureCard
              icon={Globe}
              title="Gestión Multicanal Unificada"
              description="Centraliza todas tus reservas de diferentes plataformas en un solo lugar. Olvídate de los dolores de cabeza de la gestión múltiple."
            />
            <FeatureCard
              icon={Bot}
              title="Asistente IA Integrado"
              description="Nuestro asistente IA te ayuda a optimizar precios, predecir demanda y personalizar la experiencia de tus huéspedes."
            />
            <FeatureCard
              icon={BarChart3}
              title="Análisis Avanzado en Tiempo Real"
              description="Obtén insights poderosos con nuestros dashboards interactivos. Toma decisiones informadas para maximizar tu ocupación y rentabilidad."
            />
            <FeatureCard
              icon={Calendar}
              title="Reservas Simplificadas"
              description="Proceso de reserva intuitivo y rápido. Aumenta las conversiones y reduce las cancelaciones con nuestra interfaz optimizada."
            />
          </div>

          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">
              ¿Listo para transformar tu negocio hotelero?
            </p>
            <Button onClick={onClose} size="lg" className="animate-pulse">
              Comenzar Ahora <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WelcomeScreen


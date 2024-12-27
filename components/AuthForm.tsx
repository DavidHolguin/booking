'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        router.push('/dashboard')
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Registro exitoso',
          description: 'Por favor, verifica tu correo electrónico para confirmar tu cuenta.',
        })
        router.push('/login')
      }
    }

    setIsLoading(false)
  }

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    })

    if (error) {
      toast({
        title: 'Error',
        description: `No se pudo iniciar sesión con ${provider}. Por favor, inténtelo de nuevo.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'login'
            ? 'Accede a tu cuenta para gestionar tu hotel'
            : 'Crea una cuenta para empezar a gestionar tu hotel'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10"
                />
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10"
              />
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-5 h-5 border-t-2 border-b-2 border-current rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  {mode === 'login' ? 'Iniciando' : 'Registrando'}
                </div>
              ) : (
                mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'
              )}
            </Button>
          </motion.div>
        </form>
        <div className="mt-4">
          <p className="text-center text-sm text-gray-600 mb-2">O continúa con</p>
          <div className="grid grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSocialAuth('google')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <FaGoogle />
                <span>Google</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSocialAuth('facebook')}
                className="w-full flex items-center justify-center space-x-2"
              >
                <FaFacebook />
                <span>Facebook</span>
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <Link href="/register" className="text-primary hover:underline">
              ¿No tienes una cuenta? Regístrate ahora
            </Link>
          ) : (
            <Link href="/login" className="text-primary hover:underline">
              ¿Ya tienes una cuenta? Inicia sesión
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


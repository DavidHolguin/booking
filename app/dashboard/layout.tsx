'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { Home, BedDouble, Calendar, Globe, ImageIcon, Star, Settings, LogOut, Menu, Moon, Sun, Bell, User, HelpCircle, LinkIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationList } from '@/components/NotificationList'

const navItems = [
  { name: 'Panel', href: '/dashboard', icon: Home },
  { name: 'Perfil Público', href: '/dashboard/public-profile', icon: Globe },
  { name: 'Habitaciones', href: '/dashboard/rooms', icon: BedDouble },
  { name: 'Reservas', href: '/dashboard/reservations', icon: Calendar },
  { name: 'Galería', href: '/dashboard/gallery', icon: ImageIcon },
  { name: 'Reseñas', href: '/dashboard/reviews', icon: Star },
  { name: 'Conexiones OTA', href: '/dashboard/connections', icon: LinkIcon },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface HotelInfo {
  id: string
  name: string
  logo_url: string | null
}

interface UserProfile {
  full_name: string
  email: string
  avatar_url: string | null
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    fetchHotelInfo()
    fetchUserProfile()
    fetchNotifications()

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function fetchHotelInfo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('hotels')
        .select('id, name, logo_url')
        .eq('user_id', user.id)
        .single()
      if (error) {
        console.error('Error al obtener información del hotel:', error)
      } else {
        setHotelInfo(data)
      }
    }
  }

  async function fetchUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .single()
      if (error) {
        console.error('Error al obtener perfil de usuario:', error)
      } else {
        setUserProfile(data)
      }
    }
  }

  async function fetchNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)  // Add this line to filter notifications by user_id
        .order('created_at', { ascending: false })
        .limit(1)
    
      if (error) throw error;

      if (data.length === 0) {
        // If no notifications, create a welcome notification
        const { data: insertData, error: insertError } = await supabase
          .from('notifications')
          .insert([
            { 
              user_id: user.id,  // Add this line to set the user_id
              title: 'Bienvenido', 
              message: '¡Bienvenido a nuestro sistema de gestión hotelera! Estamos encantados de tenerte aquí. Explora todas las funcionalidades y no dudes en contactarnos si necesitas ayuda.',
              type: 'info',
              read: false
            }
          ])
          .select()
      
        if (insertError) throw insertError;
      
        setNotificationCount(1)
      } else {
        // Count unread notifications
        const { count, error: countError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)  // Add this line to filter notifications by user_id
          .eq('read', false)
      
        if (countError) throw countError;
      
        setNotificationCount(count || 0)
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las notificaciones.',
        variant: 'destructive',
      })
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cerrar sesión. Por favor, inténtelo de nuevo.',
        variant: 'destructive',
      })
    } else {
      router.push('/login')
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setSidebarOpen(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            {hotelInfo && (
              <div className="flex items-center space-x-2">
                {hotelInfo.logo_url ? (
                  <Image src={hotelInfo.logo_url} alt="Logo del Hotel" width={40} height={40} className="rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-semibold">
                    {hotelInfo.name[0]}
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-lg">{hotelInfo.name}</h2>
                  <p className="text-xs text-muted-foreground">ID: {hotelInfo.id.slice(0, 8)}...</p>
                </div>
              </div>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start mb-1"
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            {userProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    <Avatar className="mr-2">
                      <AvatarImage src={userProfile.avatar_url || undefined} />
                      <AvatarFallback>{userProfile.full_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">{userProfile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/support')}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Soporte Técnico</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-card shadow-md">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Hotel Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[350px] p-0">
                <NotificationList />
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar>
                    <AvatarImage src={userProfile?.avatar_url || undefined} />
                    <AvatarFallback>{userProfile?.full_name[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/support')}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Soporte Técnico</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4">
          {children}
        </main>
      </div>
    </div>
  )
}


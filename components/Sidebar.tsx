'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BedDouble, Calendar, LinkIcon, Hotel, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/use-toast'
import { useState, useEffect } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Rooms', href: '/dashboard/rooms', icon: BedDouble },
  { name: 'Reservations', href: '/dashboard/reservations', icon: Calendar },
  { name: 'Connections', href: '/dashboard/connections', icon: LinkIcon },
  { name: 'Hotel', href: '/dashboard/hotel', icon: Hotel },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)

  useEffect(() => {
    fetchHotelId()
  }, [])

  const fetchHotelId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('hotels')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching hotel ID:', error)
      } else if (data) {
        setSelectedHotelId(data.id)
      }
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      })
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Hotel Manager</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={`${item.href}${selectedHotelId ? `?hotelId=${selectedHotelId}` : ''}`} passHref>
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}


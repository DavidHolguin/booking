import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Calendar, Info, ImageIcon, User } from 'lucide-react'
import { useTheme } from 'next-themes'

interface BottomNavProps {
  onAuthClick: () => void
  onBookingClick: () => void
}

export default function BottomNav({ onAuthClick, onBookingClick }: BottomNavProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const navItems = [
    { icon: Home, label: 'Inicio' },
    { icon: Calendar, label: 'Reservar', onClick: onBookingClick },
    { icon: Info, label: 'Info' },
    { icon: User, label: 'Cuenta', onClick: onAuthClick },
  ]

  return (
    <motion.nav
      className={`fixed bottom-0 left-0 right-0 ${
        theme === 'dark' ? 'bg-gray-900 border-t border-gray-800' : 'bg-white border-t border-gray-200'
      } py-2 px-4 z-50`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <ul className="flex justify-around">
        {navItems.map((item, index) => (
          <motion.li key={item.label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={item.onClick}
              className={`flex flex-col items-center ${
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}


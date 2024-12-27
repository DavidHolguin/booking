'use client'

import { AuthForm } from '@/components/AuthForm'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AuthForm mode="register" />
      </motion.div>
    </div>
  )
}


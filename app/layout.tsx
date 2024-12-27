import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { themeConfig } from "@/lib/theme-config"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Gestión de Hotel PWA',
  description: 'Una aplicación web progresiva moderna para la gestión de hoteles',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSkeleton } from '@/components/DashboardSkeleton'
import { motion } from 'framer-motion'
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Activity, DollarSign } from 'lucide-react'
import WelcomeScreen from '@/components/WelcomeScreen'

interface HotelStats {
  hotel_id: string
  hotel_name: string
  total_rooms: number
  available_rooms: number
  total_reservations: number
  pending_reservations: number
  monthly_revenue: number
  yearly_revenue: number
  occupancy_rate: number
  average_daily_rate: number
  revenue_per_available_room: number
}

interface RevenueData {
  date: string
  revenue: number
}

interface OccupancyData {
  date: string
  occupancy: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<HotelStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([])
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchRevenueData()
    fetchOccupancyData()
    checkFirstTimeUser()
  }, [])

  async function fetchStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase.rpc('get_hotel_stats_by_user', {
        p_user_id: user.id
      })
      if (error) {
        console.error('Error fetching hotel stats:', error)
      } else {
        setStats(data[0])
      }
    }
    setIsLoading(false)
  }

  async function fetchRevenueData() {
    // Simulated data - replace with actual API call
    const data = [
      { date: '2023-01', revenue: 4000 },
      { date: '2023-02', revenue: 3000 },
      { date: '2023-03', revenue: 5000 },
      { date: '2023-04', revenue: 4500 },
      { date: '2023-05', revenue: 6000 },
      { date: '2023-06', revenue: 5500 },
    ]
    setRevenueData(data)
  }

  async function fetchOccupancyData() {
    // Simulated data - replace with actual API call
    const data = [
      { date: 'Mon', occupancy: 70 },
      { date: 'Tue', occupancy: 75 },
      { date: 'Wed', occupancy: 80 },
      { date: 'Thu', occupancy: 85 },
      { date: 'Fri', occupancy: 90 },
      { date: 'Sat', occupancy: 95 },
      { date: 'Sun', occupancy: 88 },
    ]
    setOccupancyData(data)
  }

  async function checkFirstTimeUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Verificar si el usuario ya tiene algún hotel creado
      const { data: hotels, error: hotelsError } = await supabase
        .from('hotels')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (hotelsError) {
        console.error('Error checking user hotels:', hotelsError)
      } else if (hotels && hotels.length === 0) {
        // Si el usuario no tiene hoteles, asumimos que es su primera vez
        setShowWelcome(true)
        // Aquí podrías agregar lógica adicional si necesitas marcar que el usuario ya no es nuevo
        // Por ejemplo, podrías crear un registro en una tabla 'user_activity' o similar
      }
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return <div>No se encontraron estadísticas del hotel.</div>
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-6">
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Habitaciones</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_rooms}</div>
              <p className="text-xs text-muted-foreground">
                {stats.available_rooms} disponibles
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5, delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_reservations}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pending_reservations} pendientes
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5, delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthly_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 inline-flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +2.5%
                </span>{" "}
                vs mes anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5, delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancy_rate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500 inline-flex items-center">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  -0.5%
                </span>{" "}
                vs semana anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupación</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Mensuales</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{
                revenue: {
                  label: "Ingresos",
                  color: "hsl(var(--chart-1))",
                },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" name="Ingresos" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasa de Ocupación Semanal</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{
                occupancy: {
                  label: "Ocupación",
                  color: "hsl(var(--chart-2))",
                },
              }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="occupancy" fill="var(--color-occupancy)" name="Ocupación" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5, delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Métricas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt>Tarifa Diaria Promedio:</dt>
                  <dd className="font-semibold">
                    ${stats.average_daily_rate ? stats.average_daily_rate.toFixed(2) : 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Ingreso por Habitación Disponible:</dt>
                  <dd className="font-semibold">
                    ${stats.revenue_per_available_room ? stats.revenue_per_available_room.toFixed(2) : 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Ingresos Anuales:</dt>
                  <dd className="font-semibold">
                    ${stats.yearly_revenue ? stats.yearly_revenue.toLocaleString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ duration: 0.5, delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button>Ver Todas las Reservas</Button>
                <Button variant="outline">Gestionar Habitaciones</Button>
                <Button variant="secondary">Generar Reporte</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


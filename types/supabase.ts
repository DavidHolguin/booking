export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          room_number: string
          floor: string
          status: 'available' | 'occupied' | 'maintenance'
          type: string
          capacity: number
          price_per_night: number
          amenities: string[]
          hotel_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_number: string
          floor: string
          status: 'available' | 'occupied' | 'maintenance'
          type: string
          capacity: number
          price_per_night: number
          amenities: string[]
          hotel_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_number?: string
          floor?: string
          status?: 'available' | 'occupied' | 'maintenance'
          type?: string
          capacity?: number
          price_per_night?: number
          amenities?: string[]
          hotel_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      // ... (otras tablas)
    }
    Views: {
      v_user_hotel_details: {
        Row: {
          id: string
          name: string
          user_id: string
          // ... (otros campos relevantes)
        }
      }
    }
    Functions: {
      // ... (funciones de la base de datos si las hay)
    }
    Enums: {
      // ... (enumeraciones si las hay)
    }
  }
}

export interface HotelDetails {
  id: string
  name: string
  user_id: string
  // Add any other relevant fields from v_user_hotel_details view
}


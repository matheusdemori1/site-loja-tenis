import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos do banco de dados
export interface Brand {
  id: string
  name: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  brand_id: string
  category_id: string
  created_at: string
  brand?: Brand
  category?: Category
  colors?: ProductColor[]
}

export interface ProductColor {
  id: string
  product_id: string
  color_name: string
  image_url: string
  created_at: string
}

// Configurações do WhatsApp
export const WHATSAPP_NUMBER = "5518981100463" // Número do WhatsApp
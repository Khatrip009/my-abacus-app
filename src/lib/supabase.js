// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://cglfvgexvmbxqbcbygqj.supabase.co"
const supabaseKey = "sb_publishable_UYM16gmHAg9ljtA_NQ19AQ_6X1wWQEN"

export const supabase = createClient(supabaseUrl, supabaseKey)
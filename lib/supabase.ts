
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pvnoygfoyluxyfufsmrk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2bm95Z2ZveWx1eHlmdWZzbXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzA0NjQsImV4cCI6MjA1MDIwNjQ2NH0.r3ri8sV8GbYUhzCE7Q73JKBZHoHj8qQv7KqHbkw9ft0'

export const supabase = createClient(supabaseUrl, supabaseKey)

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wgcvrathvatxwprupeml.supabase.co'
const supabaseKey = 'sb_publishable_gUJp7YZhAQz-AsoHHNNwAg_sIjuTrZ3'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createAdmin() {
  console.log("Signing up admin user...")
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@gmail.com',
    password: 'admin123',
  })

  if (error) {
    console.error("Error creating user:", error.message)
    return
  }

  console.log("User created successfully!")
  console.log("Session:", !!data.session)
}

createAdmin()

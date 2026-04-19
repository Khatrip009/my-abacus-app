// link-auth-users.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cglfvgexvmbxqbcbygqj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbGZ2Z2V4dm1ieHFiY2J5Z3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM0NDkxOSwiZXhwIjoyMDkxOTIwOTE5fQ.NDuieVHGP3EDDr6JvloAFKEe6BFHFIZB29-T6ZpJ-SA';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function linkAuthUsers() {
  // 1. Get all users that need linking (auth_user_id is null)
  const { data: users, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('id, email, user_id')
    .is('auth_user_id', null)
    .not('email', 'is', null);

  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }

  console.log(`Found ${users.length} users to link.\n`);

  for (const user of users) {
    try {
      // 2. Check if auth user already exists by email
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      const existingAuthUser = existingUsers.users.find(u => u.email === user.email);
      let authUserId;

      if (existingAuthUser) {
        authUserId = existingAuthUser.id;
        console.log(`✅ Auth user already exists for ${user.email} (ID: ${authUserId})`);
      } else {
        // 3. Create new auth user with default password
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: 'braincity123',
          email_confirm: true,
          user_metadata: { needs_password_change: true },
        });
        if (createError) throw createError;
        authUserId = newUser.user.id;
        console.log(`🆕 Created auth user for ${user.email} (ID: ${authUserId})`);
      }

      // 4. Update public.users with auth_user_id
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ auth_user_id: authUserId })
        .eq('id', user.id);

      if (updateError) throw updateError;
      console.log(`🔗 Linked public.users record (ID: ${user.id}) to auth user.\n`);
    } catch (err) {
      console.error(`❌ Failed for ${user.email}:`, err.message);
    }
  }

  console.log('✨ All done!');
}

linkAuthUsers();
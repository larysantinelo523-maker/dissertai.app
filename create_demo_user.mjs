import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qchhvtpfrzaorhtndgiz.supabase.co';
const supabaseKey = 'REDACTED_FOR_SECURITY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function create() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'video@disserta.ai',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { first_name: 'Demo', last_name: 'Video', phone: '11999999999' }
  });
  
  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }
  
  console.log('User created successfully:', data.user?.id);

  if (data.user) {
    const { error: roleError } = await supabase.from('user_roles').insert({ id: data.user.id, role: 'user' });
    if (roleError) console.error('Error inserting role:', roleError);
    else console.log('Role inserted');
  }
}

create();

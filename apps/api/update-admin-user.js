import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL);

async function updateAdminUser() {
  try {
    console.log('Updating admin user to internal status...');

    const result = await sql`
      UPDATE "user"
      SET is_internal = true
      WHERE email = 'piousalpha@gmail.com'
      RETURNING id, name, email, is_internal
    `;

    if (result.length > 0) {
      console.log('\n✅ User updated successfully:');
      console.log('   Email:', result[0].email);
      console.log('   Name:', result[0].name);
      console.log('   isInternal:', result[0].is_internal);
      console.log('\n✅ Admin user can now access /admin/users page');
    } else {
      console.log('❌ No user found with email: piousalpha@gmail.com');
    }
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
    process.exit(1);
  }
}

updateAdminUser();

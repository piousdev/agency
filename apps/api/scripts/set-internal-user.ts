import { config } from 'dotenv';
import { db } from '../src/db/index.js';
import { user } from '../src/db/schema/user.js';
import { eq } from 'drizzle-orm';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(process.cwd(), '../../.env') });

async function setInternalUser() {
  try {
    const email = 'piousalpha@gmail.com';

    // Update user to be internal
    const result = await db
      .update(user)
      .set({ isInternal: true })
      .where(eq(user.email, email))
      .returning();

    if (result.length > 0) {
      console.log('✅ User updated successfully:');
      console.log(`   Email: ${result[0].email}`);
      console.log(`   Name: ${result[0].name}`);
      console.log(`   isInternal: ${result[0].isInternal}`);
    } else {
      console.log('❌ No user found with email:', email);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
}

setInternalUser();

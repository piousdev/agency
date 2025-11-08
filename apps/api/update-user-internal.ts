import { db } from './src/db/index.js';
import { user } from './src/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function updateUser() {
  const result = await db
    .update(user)
    .set({ isInternal: true })
    .where(eq(user.email, 'test.internal@agency.local'))
    .returning();

  console.log('Updated user:', JSON.stringify(result, null, 2));
  process.exit(0);
}

updateUser().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { db } from '../src/db/index.js';
import { user } from '../src/db/schema/user.js';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Updating test user to internal...');

  const result = await db
    .update(user)
    .set({ isInternal: true })
    .where(eq(user.email, 'test.internal@agency.local'))
    .returning();

  console.log('Updated user:', result);
  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

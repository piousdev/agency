import 'dotenv/config';
import { db } from '../db/index.js';
import { user } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';

const adminEmail = process.env.ADMIN_EMAIL || 'piousalpha@gmail.com';

const [adminUser] = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);

if (adminUser) {
  console.log(
    JSON.stringify({ id: adminUser.id, email: adminUser.email, name: adminUser.name }, null, 2)
  );
} else {
  console.error(`Admin user not found: ${adminEmail}`);
  process.exit(1);
}

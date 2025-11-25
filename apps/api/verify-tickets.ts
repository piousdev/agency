import { db } from './src/db';
import { ticket, user } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function verify() {
  const adminUser = await db.query.user.findFirst({
    where: eq(user.email, 'piousalpha@gmail.com'),
  });

  if (!adminUser) {
    console.log('Admin user not found');
    process.exit(1);
  }

  console.log('Admin user ID:', adminUser.id);

  const adminTickets = await db.query.ticket.findMany({
    where: eq(ticket.assignedToId, adminUser.id),
  });

  console.log('\nTickets assigned to admin:', adminTickets.length);
  adminTickets.forEach((t) => {
    const dueStr = t.dueAt ? new Date(t.dueAt).toLocaleDateString() : 'No due date';
    console.log('  -', t.title, '| Status:', t.status, '| Due:', dueStr);
  });
  process.exit(0);
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});

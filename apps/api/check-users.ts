import { db } from './src/db/index.js';

async function checkUsers() {
  const users = await db.query.user.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      isInternal: true,
    },
    limit: 10,
  });

  console.log('Users in database:', JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUsers().catch(console.error);

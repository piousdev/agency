/**
 * Admin User Creation Script
 *
 * Creates an admin user from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME).
 * Directly inserts into database to bypass email verification requirement.
 */

import 'dotenv/config';
import { db } from '../db/index.js';
import { user, account } from '../db/schema/index.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { createHash, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Hash password using scrypt (Node.js native crypto)
 * Better-Auth may use bcrypt, but scrypt is built-in and secure
 */
async function hashPassword(password: string): Promise<string> {
  const salt = createHash('sha256').update(Date.now().toString()).digest('hex').slice(0, 16);
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function createAdmin() {
  try {
    console.log('🌱 Creating admin user...\n');

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Debug: log environment variables
    console.log('📋 Environment variables:');
    console.log(`   ADMIN_EMAIL: ${adminEmail}`);
    console.log(`   ADMIN_PASSWORD: ${adminPassword ? '[SET]' : '[NOT SET]'}`);
    console.log(`   ADMIN_NAME (raw): "${process.env.ADMIN_NAME}"`);
    console.log(`   ADMIN_NAME (final): "${adminName}"\n`);

    if (!adminEmail || !adminPassword) {
      console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      console.log('\nExample:');
      console.log('  ADMIN_EMAIL=admin@example.com');
      console.log('  ADMIN_PASSWORD=your_secure_password');
      console.log('  ADMIN_NAME=Admin User (optional)\n');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(adminEmail)) {
      console.error('❌ Error: Invalid email format');
      process.exit(1);
    }

    // Validate password strength (minimum 8 characters)
    if (adminPassword.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters long');
      process.exit(1);
    }

    // Check if admin user already exists
    const existingUser = await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.email, adminEmail),
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${adminEmail} already exists`);
      console.log(`   Current Name: ${existingUser.name}`);
      console.log(`   Current Role: ${existingUser.role}`);
      console.log(`   Current Email Verified: ${existingUser.emailVerified}`);
      console.log(`   Current Is Internal: ${existingUser.isInternal}\n`);

      // Update user if any property is different
      const needsUpdate =
        existingUser.name !== adminName ||
        existingUser.role !== 'admin' ||
        !existingUser.emailVerified ||
        !existingUser.isInternal;

      if (needsUpdate) {
        console.log('🔧 Updating user...');

        await db
          .update(user)
          .set({
            name: adminName,
            role: 'admin',
            emailVerified: true,
            isInternal: true,
          })
          .where(eq(user.id, existingUser.id));

        console.log('✅ User updated successfully!\n');
        console.log('Updated properties:');
        console.log(`  Name: ${adminName}`);
        console.log(`  Role: admin`);
        console.log(`  Email Verified: true`);
        console.log(`  Is Internal: true\n`);
      } else {
        console.log('✅ User is already up to date\n');
      }

      process.exit(0);
    }

    console.log('Creating admin user...');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Name: ${adminName}`);
    console.log(`  Role: admin\n`);

    // Create user record
    const userId = nanoid();
    await db.insert(user).values({
      id: userId,
      name: adminName,
      email: adminEmail,
      emailVerified: true, // Skip email verification for admin
      role: 'admin',
      isInternal: true,
      capacityPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create account record with hashed password
    await db.insert(account).values({
      id: nanoid(),
      accountId: userId,
      providerId: 'credential',
      userId: userId,
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('You can now sign in with:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: [the password you provided]`);
    console.log(
      `\n⚠️  Note: If login fails, you may need to reset the password via Better-Auth API\n`
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run create admin
void createAdmin();

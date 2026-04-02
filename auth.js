import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

// Helper to fetch a user from the database
async function getUser(email) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validate input with Zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log('Invalid input format');
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Fetch user from DB
        const user = await getUser(email);
        if (!user) {
          console.log('User not found');
          return null;
        }

        // Compare password with hashed password in DB
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          console.log('Invalid credentials');
          return null;
        }

        // Return user object if credentials are correct
        return user;
      },
    }),
  ],
});
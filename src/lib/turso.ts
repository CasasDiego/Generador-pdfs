import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('Please define the TURSO_DATABASE_URL environment variable');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Please define the TURSO_AUTH_TOKEN environment variable');
}

const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

tursoClient
  .execute('SELECT 1;')
  .then(() => {
    console.log('[DB] Conexión a Turso OK');
  })
  .catch((error) => {
    console.error('[DB] Error al conectar a Turso:', error);
  });

export const db = drizzle(tursoClient as any) as any;
export default db;


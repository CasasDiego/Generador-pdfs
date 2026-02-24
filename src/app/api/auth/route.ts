import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/turso';
import { usersTable } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, password, action, newId, newPassword, newRole, userId } = body;

  try {
    if (action === 'login') {
      // En el body, "id" es el nombre de usuario
      const users = await db
        .select({
          id: usersTable.id,
          username: usersTable.username,
          role: usersTable.role,
        })
        .from(usersTable)
        .where(and(eq(usersTable.username, id), eq(usersTable.password, password)))
        .limit(1);

      if (users.length > 0) {
        const user = users[0];
        return NextResponse.json({ success: true, role: user.role, id: user.username });
      }

      return NextResponse.json(
        { success: false, message: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    if (action === 'getUsers') {
      const users = await db
        .select({
          id: usersTable.username,
          role: usersTable.role,
        })
        .from(usersTable);

      return NextResponse.json({ users });
    }

    if (action === 'createUser') {
      const existing = await db
        .select({ username: usersTable.username })
        .from(usersTable)
        .where(eq(usersTable.username, newId))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'El usuario ya existe' },
          { status: 400 }
        );
      }

      await db
        .insert(usersTable)
        .values({
          id: newId,
          username: newId,
          password: newPassword,
          role: newRole,
        });

      return NextResponse.json({ success: true });
    }

    if (action === 'updateUser') {
      const result = await db
        .update(usersTable)
        .set({ password: newPassword })
        .where(eq(usersTable.username, userId));

      const changes = 'rowsAffected' in result ? (result as any).rowsAffected ?? 0 : 0;

      if (changes > 0) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: false }, { status: 400 });

  } catch (error) {
    console.error('DB error en /api/auth:', error);
    return NextResponse.json(
      { success: false, message: 'Error de base de datos' },
      { status: 500 }
    );
  }
}

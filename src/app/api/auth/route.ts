import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Usuarios de respaldo (hardcodeados) - se usan si MongoDB falla
const fallbackUsers = [
  { id: 'admin', password: 'admin123', role: 'admin' },
  { id: 'usuario', password: 'user123', role: 'user' }
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, password, action, newId, newPassword, newRole, userId } = body;

  try {
    // Intentar conectar a MongoDB
    const client = await clientPromise;
    const db = client.db('pdf-generator');
    const usersCollection = db.collection('users');

    // Inicializar usuarios por defecto si la colección está vacía
    const count = await usersCollection.countDocuments();
    if (count === 0) {
      await usersCollection.insertMany(fallbackUsers);
    }

    if (action === 'login') {
      const user = await usersCollection.findOne({ id, password });
      if (user) {
        return NextResponse.json({ success: true, role: user.role, id: user.id });
      }
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (action === 'getUsers') {
      const users = await usersCollection.find({}).project({ password: 0 }).toArray();
      return NextResponse.json({ users });
    }

    if (action === 'createUser') {
      const existingUser = await usersCollection.findOne({ id: newId });
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'El usuario ya existe' }, { status: 400 });
      }
      await usersCollection.insertOne({ id: newId, password: newPassword, role: newRole });
      return NextResponse.json({ success: true });
    }

    if (action === 'updateUser') {
      const result = await usersCollection.updateOne(
        { id: userId },
        { $set: { password: newPassword } }
      );
      if (result.matchedCount > 0) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: false }, { status: 400 });

  } catch (error) {
    // Si MongoDB falla, usar usuarios de respaldo
    console.error('MongoDB error, usando usuarios de respaldo:', error);

    if (action === 'login') {
      const user = fallbackUsers.find(u => u.id === id && u.password === password);
      if (user) {
        return NextResponse.json({ success: true, role: user.role, id: user.id });
      }
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (action === 'getUsers') {
      return NextResponse.json({ users: fallbackUsers.map(u => ({ id: u.id, role: u.role })) });
    }

    if (action === 'createUser') {
      return NextResponse.json({ success: false, message: 'Base de datos no disponible' }, { status: 503 });
    }

    if (action === 'updateUser') {
      return NextResponse.json({ success: false, message: 'Base de datos no disponible' }, { status: 503 });
    }

    return NextResponse.json({ success: false }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const users = [
  { id: 'admin', password: 'admin123', role: 'admin' },
  { id: 'usuario', password: 'user123', role: 'user' }
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, password, action, newId, newPassword, newRole, userId } = body;

  if (action === 'login') {
    const user = users.find(u => u.id === id && u.password === password);
    if (user) {
      return NextResponse.json({ success: true, role: user.role, id: user.id });
    }
    return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
  }

  if (action === 'getUsers') {
    return NextResponse.json({ users: users.map(u => ({ id: u.id, role: u.role })) });
  }

  if (action === 'createUser') {
    if (users.find(u => u.id === newId)) {
      return NextResponse.json({ success: false, message: 'El usuario ya existe' }, { status: 400 });
    }
    users.push({ id: newId, password: newPassword, role: newRole });
    return NextResponse.json({ success: true });
  }

  if (action === 'updateUser') {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.password = newPassword;
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: false }, { status: 400 });
}

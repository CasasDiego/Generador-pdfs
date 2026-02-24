import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, userId, excelFileName, pdfFileName } = body;

  try {
    const client = await clientPromise;
    const db = client.db('pdf-generator');
    const logsCollection = db.collection('logs');

    if (action === 'add') {
      const newLog = {
        userId,
        action: 'Generación de PDFs',
        excelFile: excelFileName,
        pdfFile: pdfFileName,
        date: new Date().toLocaleDateString('es-ES'),
        time: new Date().toLocaleTimeString('es-ES'),
        timestamp: new Date(),
      };
      await logsCollection.insertOne(newLog);
      return NextResponse.json({ success: true });
    }

    if (action === 'addLogin') {
      const newLog = {
        userId,
        action: 'Inicio de sesión',
        excelFile: '-',
        pdfFile: '-',
        date: new Date().toLocaleDateString('es-ES'),
        time: new Date().toLocaleTimeString('es-ES'),
        timestamp: new Date(),
      };
      await logsCollection.insertOne(newLog);
      return NextResponse.json({ success: true });
    }

    if (action === 'getLogs') {
      const logs = await logsCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();
      return NextResponse.json({ logs });
    }

    return NextResponse.json({ success: false }, { status: 400 });
  } catch (error) {
    console.error('Error en logs:', error);
    return NextResponse.json({ success: false, error: 'Error de base de datos' }, { status: 500 });
  }
}

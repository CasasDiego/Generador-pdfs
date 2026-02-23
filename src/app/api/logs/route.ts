import { NextRequest, NextResponse } from 'next/server';

// Almacenamiento en memoria de los logs
let logs: any[] = [];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, userId, excelFileName, pdfFileName } = body;

  if (action === 'add') {
    const newLog = {
      id: Date.now(),
      userId,
      action: 'Generación de PDFs',
      excelFile: excelFileName,
      pdfFile: pdfFileName,
      date: new Date().toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES'),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // Agregar al inicio
    return NextResponse.json({ success: true });
  }

  if (action === 'addLogin') {
    const newLog = {
      id: Date.now(),
      userId,
      action: 'Inicio de sesión',
      excelFile: '-',
      pdfFile: '-',
      date: new Date().toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES'),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    return NextResponse.json({ success: true });
  }

  if (action === 'getLogs') {
    return NextResponse.json({ logs });
  }

  return NextResponse.json({ success: false }, { status: 400 });
}

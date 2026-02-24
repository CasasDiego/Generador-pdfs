import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/turso';
import { logsTable } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, userId, excelFileName, pdfFileName } = body;

  try {
    if (action === 'add') {
      const now = new Date();
      await db.insert(logsTable).values({
        userId,
        action: 'Generación de PDFs',
        excelFile: excelFileName,
        pdfFile: pdfFileName,
        date: now.toLocaleDateString('es-ES'),
        time: now.toLocaleTimeString('es-ES'),
        timestamp: now.toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'addLogin') {
      const now = new Date();
      await db.insert(logsTable).values({
        userId,
        action: 'Inicio de sesión',
        excelFile: '-',
        pdfFile: '-',
        date: now.toLocaleDateString('es-ES'),
        time: now.toLocaleTimeString('es-ES'),
        timestamp: now.toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'getLogs') {
      const logs = await db
        .select({
          userId: logsTable.userId,
          action: logsTable.action,
          excelFile: logsTable.excelFile,
          pdfFile: logsTable.pdfFile,
          date: logsTable.date,
          time: logsTable.time,
          timestamp: logsTable.timestamp,
        })
        .from(logsTable)
        .orderBy(desc(logsTable.timestamp))
        .limit(100);

      return NextResponse.json({ logs });
    }

    return NextResponse.json({ success: false }, { status: 400 });
  } catch (error) {
    console.error('Error en logs:', error);
    return NextResponse.json(
      { success: false, error: 'Error de base de datos' },
      { status: 500 }
    );
  }
}

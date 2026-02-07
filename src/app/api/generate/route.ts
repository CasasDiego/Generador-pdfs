import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

// Configuración de la posición del nombre en el PDF
const NAME_CONFIG = {
  x: 390, // Posición X (centrado aproximado en página A4)
  y: 336, // Posición Y desde abajo
  width: 520, // Ancho del área del nombre
  height: 70, // Alto del área del nombre
  maxFontSize: 42, // Tamaño máximo de fuente
  minFontSize: 18, // Tamaño mínimo de fuente
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const excelFile = formData.get('excel') as File;
    const pdfFile = formData.get('pdf') as File;

    if (!excelFile || !pdfFile) {
      return NextResponse.json(
        { error: 'Faltan archivos requeridos' },
        { status: 400 }
      );
    }

    // Leer nombres del Excel
    const excelBuffer = await excelFile.arrayBuffer();
    const workbook = XLSX.read(excelBuffer);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
    
     // Extraer nombres:
// - En tu Excel los nombres están en la columna B (índice 1)
// - La primera fila con "NOMBRES" debe ignorarse
     const names = data
     .map((row) => (row?.[1] ?? "")) // 👈 columna B
     .map((v) => String(v).trim())
     .filter((v) => v && v.toUpperCase() !== "NOMBRES");


    if (names.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron nombres en el Excel' },
        { status: 400 }
      );
    }

    if (names.length > 1000) {
      return NextResponse.json(
        { error: 'El Excel contiene más de 1000 registros' },
        { status: 400 }
      );
    }

    // Leer plantilla PDF
    const pdfBuffer = await pdfFile.arrayBuffer();
    const templatePdf = await PDFDocument.load(pdfBuffer);

    // Crear ZIP
    const zip = new JSZip();

    // Generar un PDF por cada nombre
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Obtener la primera página
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      // Cargar fuente
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const textColor = rgb(0.35, 0.35, 0.35); // gris parecido al ejemplo

      // Calcular tamaño de fuente apropiado
      let fontSize = NAME_CONFIG.maxFontSize;
      let textWidth = font.widthOfTextAtSize(name, fontSize);
      
      while (textWidth > NAME_CONFIG.width && fontSize > NAME_CONFIG.minFontSize) {
        fontSize -= 1;
        textWidth = font.widthOfTextAtSize(name, fontSize);
      }
      
      // Dibujar rectángulo blanco para cubrir el nombre original
      firstPage.drawRectangle({
        x: NAME_CONFIG.x - NAME_CONFIG.width / 2,
        y: NAME_CONFIG.y - NAME_CONFIG.height / 2,
        width: NAME_CONFIG.width,
        height: NAME_CONFIG.height,
        color: rgb(1, 1, 1),
      });
      
      // Escribir el nuevo nombre centrado
     /* const textX = NAME_CONFIG.x - textWidth / 2;
      const textY = NAME_CONFIG.y;
      
      firstPage.drawText(name, {
        x: textX,
        y: textY,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });  */
      // Rectángulo (cover) centrado
const rectX = NAME_CONFIG.x - NAME_CONFIG.width / 2;
const rectY = NAME_CONFIG.y - NAME_CONFIG.height / 2;

firstPage.drawRectangle({
  x: rectX,
  y: rectY,
  width: NAME_CONFIG.width,
  height: NAME_CONFIG.height,
  color: rgb(1, 1, 1),
});

// Posición centrada real (y ajustada por baseline)
const textX = NAME_CONFIG.x - textWidth / 2;

// pdf-lib usa baseline, así que lo subimos un poco para que se vea centrado
const textY =
  rectY + (NAME_CONFIG.height - fontSize) / 2 + 2; // +2 ajuste fino

firstPage.drawText(name, {
  x: textX,
  y: textY,
  size: fontSize,
  font,
  color: textColor,
});

      
      // Guardar PDF
      const pdfBytes = await pdfDoc.save();
      
      // Agregar al ZIP con nombre correlativo
      const fileNumber = String(i + 1).padStart(3, '0');
      const fileName = `${fileNumber} - ${name}.pdf`;
      zip.file(fileName, pdfBytes);
    }

    // Generar ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Retornar ZIP
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="certificados.zip"',
      },
    });
  } catch (error) {
    console.error('Error al generar PDFs:', error);
    return NextResponse.json(
      { error: 'Error al procesar los archivos' },
      { status: 500 }
    );
  }
}

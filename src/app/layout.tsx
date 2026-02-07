export const metadata = {
  title: 'Generador Masivo de PDFs',
  description: 'Genera múltiples PDFs personalizados desde Excel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}

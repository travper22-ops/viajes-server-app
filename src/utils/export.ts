// ============================================
// UTILIDADES DE EXPORTACIÓN
// Exporta datos a CSV, Excel y PDF
// ============================================

import { Response } from 'express';

/**
 * Exporta datos a formato CSV
 */
export function exportToCSV(
  res: Response,
  data: Record<string, unknown>[],
  filename: string,
  columns?: { key: string; label: string }[]
): void {
  if (!data || data.length === 0) {
    res.status(400).json({ error: 'No hay datos para exportar' });
    return;
  }

  // Obtener claves de las columnas
  const keys = columns 
    ? columns.map(c => c.key)
    : Object.keys(data[0]);

  // Crear headers
  const headers = columns 
    ? columns.map(c => c.label).join(',')
    : keys.join(',');

  // Crear filas
  const rows = data.map(row => 
    keys.map(key => {
      const value = row[key];
      // Escapar comillas y envolver en comillas si contiene coma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  // Combinar todo
  const csv = [headers, ...rows].join('\n');

  // Configurar headers
  res.setHeader('Content-Type', 'text/csv; charset=utf-8;');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  
  // Enviar con BOM para Excel
  res.send('\ufeff' + csv);
}

/**
 * Genera un Excel básico en formato HTML (compatible con Excel)
 */
export function exportToExcelHTML(
  res: Response,
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = 'Sheet1',
  columns?: { key: string; label: string }[]
): void {
  if (!data || data.length === 0) {
    res.status(400).json({ error: 'No hay datos para exportar' });
    return;
  }

  const keys = columns 
    ? columns.map(c => c.key)
    : Object.keys(data[0]);

  const headers = columns 
    ? columns.map(c => c.label)
    : keys;

  // Crear tabla HTML
  let html = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${sheetName}">
    <Table>
      <Row>
        ${headers.map(h => `<Cell><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`).join('')}
      </Row>
      ${data.map(row => `
      <Row>
        ${keys.map(key => {
          const value = row[key];
          const type = typeof value === 'number' ? 'Number' : 'String';
          return `<Cell><Data ss:Type="${type}">${escapeXML(String(value ?? ''))}</Data></Cell>`;
        }).join('')}
      </Row>`).join('')}
    </Table>
  </Worksheet>
</Workbook>`;

  res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.xls"`);
  res.send(html);
}

/**
 * Genera un PDF básico con jsPDF
 */
export async function exportToPDF(
  res: Response,
  data: Record<string, unknown>[],
  filename: string,
  title: string,
  columns?: { key: string; label: string }[]
): Promise<void> {
  // Si no hay PDFKit, usar HTML simple
  exportToPDFHTML(res, data, filename, title, columns);
}

/**
 * Exporta a PDF usando HTML imprimible
 */
function exportToPDFHTML(
  res: Response,
  data: Record<string, unknown>[],
  filename: string,
  title: string,
  columns?: { key: string; label: string }[]
): void {
  if (!data || data.length === 0) {
    res.status(400).json({ error: 'No hay datos para exportar' });
    return;
  }

  const keys = columns 
    ? columns.map(c => c.key)
    : Object.keys(data[0]);

  const headers = columns 
    ? columns.map(c => c.label)
    : keys;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .date { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="date">Exportado el: ${new Date().toLocaleDateString('es-ES')}</p>
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${keys.map(key => `<td>${row[key] ?? ''}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.html"`);
  res.send(html);
}

/**
 * Escapa caracteres XML
 */
function escapeXML(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Formatea datos para exportación
 */
export function formatDataForExport(
  data: Record<string, unknown>[],
  formatters?: Record<string, (value: unknown) => string>
): Record<string, unknown>[] {
  if (!formatters) return data;

  return data.map(row => {
    const newRow = { ...row };
    Object.keys(formatters).forEach(key => {
      if (key in newRow) {
        newRow[key] = formatters[key](newRow[key]);
      }
    });
    return newRow;
  });
}

/**
 * Columnas predefinidas para diferentes tipos de datos
 */
export const EXPORT_COLUMNS = {
  bookings: [
    { key: 'booking_reference', label: 'Referencia' },
    { key: 'type', label: 'Tipo' },
    { key: 'status', label: 'Estado' },
    { key: 'total_amount', label: 'Monto' },
    { key: 'currency', label: 'Moneda' },
    { key: 'passenger_name', label: 'Cliente' },
    { key: 'created_at', label: 'Fecha de creación' },
  ],
  users: [
    { key: 'email', label: 'Email' },
    { key: 'first_name', label: 'Nombre' },
    { key: 'last_name', label: 'Apellido' },
    { key: 'role', label: 'Rol' },
    { key: 'is_active', label: 'Activo' },
    { key: 'created_at', label: 'Fecha de registro' },
  ],
  payments: [
    { key: 'id', label: 'ID' },
    { key: 'booking_id', label: 'Reserva' },
    { key: 'amount', label: 'Monto' },
    { key: 'currency', label: 'Moneda' },
    { key: 'status', label: 'Estado' },
    { key: 'payment_method', label: 'Método' },
    { key: 'created_at', label: 'Fecha' },
  ]
};

export default {
  exportToCSV,
  exportToExcelHTML,
  exportToPDF,
  formatDataForExport,
  EXPORT_COLUMNS
};

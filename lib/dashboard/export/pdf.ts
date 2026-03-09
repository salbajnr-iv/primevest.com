export function downloadSimplePDF(title: string, rows: Array<Record<string, unknown>>): void {
  const htmlRows = rows
    .map((row) => `<tr>${Object.values(row).map((value) => `<td style=\"padding:8px;border:1px solid #ddd\">${String(value)}</td>`).join("")}</tr>`)
    .join("");

  const popup = window.open("", "_blank", "width=1000,height=700");
  if (!popup) return;

  popup.document.write(`
    <html>
      <head><title>${title}</title></head>
      <body style="font-family:Arial,sans-serif;padding:24px;">
        <h1>${title}</h1>
        <p>Exported at ${new Date().toLocaleString()}</p>
        <table style="border-collapse:collapse;width:100%;">
          <tbody>${htmlRows}</tbody>
        </table>
        <script>window.print();</script>
      </body>
    </html>
  `);
  popup.document.close();
}

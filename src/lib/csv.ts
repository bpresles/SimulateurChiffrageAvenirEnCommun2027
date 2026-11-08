/** Génère un CSV compatible Excel (séparateur « ; », BOM UTF-8). */
export function versCsv(entetes: string[], lignes: string[][]): string {
  const echapper = (v: string) => (/[";\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const corps = [entetes, ...lignes].map((l) => l.map(echapper).join(';')).join('\r\n')
  return '﻿' + corps
}

export function telechargerCsv(nom: string, contenu: string): void {
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

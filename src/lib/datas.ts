// "YYYY-MM-DD" → "DD/MM/YYYY", como o brasileiro lê.
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

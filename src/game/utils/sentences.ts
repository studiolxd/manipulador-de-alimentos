/**
 * Divide un texto en frases para los bocadillos con máquina de escribir: cada
 * frase termina en ".", salvo el último trozo cuando el texto original acaba
 * en otro signo (p.ej. "¡Buena suerte!"), que se deja tal cual.
 */
export const splitSentences = (text: string): string[] => {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const endsWithPeriod = normalized.endsWith('.')

  const parts = normalized
    .split('.')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  return parts.map((part, index) => (index === parts.length - 1 && !endsWithPeriod ? part : `${part}.`))
}

import { useEffect, useRef, useState } from 'react'

interface UseSentenceTypewriterResult {
  displayedText: string
  sentenceIndex: number
  // true solo cuando ya se ha escrito la última frase.
  done: boolean
  advance: () => void
}

/**
 * Recorre `sentences` una a una, escribiendo la frase actual letra a letra
 * cada `delayMs` ms. No hay ningún avance automático por tiempo: al
 * terminar de escribirse una frase (salvo la última) se queda en pantalla
 * hasta que el usuario pide avanzar con `advance()` (Enter o clic en
 * cualquier sitio, ver SpeechBubble), momento en el que se borra y empieza
 * la siguiente. No reinicia por su cuenta si `sentences` cambia en el mismo
 * componente montado: el llamador debe usar una `key` distinta por mensaje
 * (ver BubblesOverlay) para que el hook nazca limpio en cada bocadillo nuevo.
 */
export const useSentenceTypewriter = (
  sentences: string[],
  delayMs: number,
  active: boolean,
): UseSentenceTypewriterResult => {
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!active || done) {
      return
    }

    const currentSentence = sentences[sentenceIndex] ?? ''

    if (charIndex < currentSentence.length) {
      timeoutRef.current = window.setTimeout(() => setCharIndex((prev) => prev + 1), delayMs)
      return () => window.clearTimeout(timeoutRef.current)
    }

    // Frase completa. En la última no hay nada más que esperar: se da el
    // bocadillo por terminado (con un timeout(0) para no actualizar estado
    // de forma síncrona dentro del efecto). En las demás se queda tal cual
    // hasta que el usuario llame a `advance()`.
    if (sentenceIndex >= sentences.length - 1) {
      timeoutRef.current = window.setTimeout(() => setDone(true), 0)
      return () => window.clearTimeout(timeoutRef.current)
    }
  }, [active, done, sentences, sentenceIndex, charIndex, delayMs])

  // Con la frase actual a medio escribir, la deja completa al instante (sin
  // saltar a la última frase). Con la frase actual ya completa, borra y pasa
  // a la siguiente. En la última frase no hay nada más a lo que saltar.
  const advance = () => {
    const currentSentence = sentences[sentenceIndex] ?? ''

    if (charIndex < currentSentence.length) {
      window.clearTimeout(timeoutRef.current)
      setCharIndex(currentSentence.length)
      return
    }

    if (sentenceIndex >= sentences.length - 1) {
      return
    }

    window.clearTimeout(timeoutRef.current)
    setSentenceIndex((prev) => prev + 1)
    setCharIndex(0)
  }

  const displayedText = (sentences[sentenceIndex] ?? '').slice(0, charIndex)

  return { displayedText, sentenceIndex, done, advance }
}

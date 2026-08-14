/**
 * Datos y textos propios de las Actividades 1 y 2 (estáticos: los renderiza
 * directamente React, no hace falta que viajen por el EventBus).
 */

export interface ConceptDef {
  label: string
  correct: boolean
}

export const CONCEPTS: ConceptDef[] = [
  { label: 'Cocinar', correct: true },
  { label: 'Lavarse las manos', correct: true },
  { label: 'Servir alimentos', correct: true },
  { label: 'Limpiar utensilios', correct: true },
  { label: 'Almacenar alimentos', correct: true },
  { label: 'Controlar temperaturas', correct: true },
  { label: 'Evitar contaminaciones', correct: true },
  { label: 'Seguridad alimentaria', correct: true },
  { label: 'Decorar el restaurante', correct: false },
  { label: 'Gestionar reservas', correct: false },
  { label: 'Atender llamadas', correct: false },
]

export const ACTIVITY1_TITLE = '¿Qué palabras o ideas relacionas con un manipulador de alimentos?'
export const ACTIVITY1_SUBTITLE =
  'No te preocupes si no conoces la respuesta exacta. Pulsa sobre las palabras o ideas que creas que están relacionadas.'

// Tres variantes de feedback tras confirmar la Actividad 1, según el resultado:
export const ACTIVITY1_FEEDBACK_SUCCESS =
  '¡Bien hecho! Has identificado muy bien las palabras relacionadas con la manipulación de alimentos. Se nota que tienes buen instinto para esto.'
// Ha marcado alguna palabra que no está relacionada (independientemente de si además le faltó alguna correcta).
export const ACTIVITY1_FEEDBACK_WRONG =
  'No te preocupes si te has equivocado en alguna, es totalmente normal. Irás aprendiendo a medida que avances en tu formación.'
// No ha marcado ninguna incorrecta, pero le ha faltado alguna correcta por seleccionar.
export const ACTIVITY1_FEEDBACK_MISSED =
  'Te han faltado algunas palabras relacionadas con la manipulación de alimentos. No pasa nada, es normal si todavía no las conocías todas: iremos repasándolas a lo largo de la formación.'

// Pantalla "Actividad 2": arrastrar cada tarjeta (una consecuencia de una
// mala manipulación) hasta a quién afecta principalmente.
export type Activity2Category = 'consumidor' | 'establecimiento' | 'manipulador'

export interface Activity2CardDef {
  label: string
  category: Activity2Category
}

export const ACTIVITY2_INSTRUCTION =
  'Arrastra cada tarjeta hasta quién se ve afectado por esa consecuencia: el consumidor, el establecimiento o el manipulador.'

// Dos variantes de feedback tras confirmar la Actividad 2 (pantalla "Resultado 2"), según el resultado:
export const ACTIVITY2_FEEDBACK_SUCCESS =
  '¡Bien hecho! Has identificado muy bien las consecuencias de una mala manipulación y a quién afectan. Se nota que tienes clara la importancia de nuestro trabajo.'
export const ACTIVITY2_FEEDBACK_WRONG =
  'No te preocupes si te has equivocado en alguna, es totalmente normal. Irás aprendiendo a identificar las consecuencias de una mala manipulación a medida que avances en tu formación.'

export const ACTIVITY2_CATEGORIES: { key: Activity2Category; label: string }[] = [
  { key: 'consumidor', label: 'Consumidor' },
  { key: 'establecimiento', label: 'Establecimiento' },
  { key: 'manipulador', label: 'Manipulador' },
]

export const ACTIVITY2_CARD_DEFS: Activity2CardDef[] = [
  { label: 'Intoxicación alimentaria', category: 'consumidor' },
  { label: 'Síntomas graves', category: 'consumidor' },
  { label: 'Ingreso hospitalario', category: 'consumidor' },
  { label: 'Reacción alérgica grave', category: 'consumidor' },
  { label: 'Quejas de clientes', category: 'establecimiento' },
  { label: 'Devolución de productos', category: 'establecimiento' },
  { label: 'Desperdicio de alimentos', category: 'establecimiento' },
  { label: 'Pérdidas económicas', category: 'establecimiento' },
  { label: 'Inspecciones y sanciones', category: 'establecimiento' },
  { label: 'Cierre del negocio', category: 'establecimiento' },
  { label: 'Pérdida de reputación', category: 'establecimiento' },
  { label: 'Consecuencias laborales', category: 'manipulador' },
  { label: 'Responsabilidad administrativa', category: 'manipulador' },
  { label: 'Responsabilidad civil', category: 'manipulador' },
  { label: 'Responsabilidad penal', category: 'manipulador' },
  { label: 'Responsabilidad personal', category: 'manipulador' },
]

// Pantalla "Encimera": los tres platos son botones.
export const COUNTER_SELECT_INSTRUCTION = 'Selecciona uno de los tres platos para descubrir qué ha podido fallar.'

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

export const ACTIVITY1_FEEDBACK_SUCCESS =
  '¡Bien hecho! Has identificado muy bien las palabras relacionadas con la manipulación de alimentos. Se nota que tienes buen instinto para esto.'
export const ACTIVITY1_FEEDBACK_PARTIAL =
  '¡Muy bien! No te preocupes si te has equivocado en alguna, es totalmente normal. Irás aprendiendo a medida que avances en tu formación.'

// Pantalla "Actividad 2": arrastrar cada tarjeta hasta su categoría.
export type Activity2Category = 'consumidores' | 'trabajoSeguro' | 'establecimiento'

export interface Activity2CardDef {
  label: string
  category: Activity2Category
}

export const ACTIVITY2_INSTRUCTION =
  'Arrastra cada tarjeta hasta la categoría a la que puede afectar. Algunas situaciones podrían tener consecuencias en más de un grupo, pero céntrate en su efecto principal.'

export const ACTIVITY2_CATEGORIES: { key: Activity2Category; label: string }[] = [
  { key: 'consumidores', label: 'Consumidores' },
  { key: 'trabajoSeguro', label: 'Trabajo seguro' },
  { key: 'establecimiento', label: 'Establecimiento' },
]

export const ACTIVITY2_CARD_DEFS: Activity2CardDef[] = [
  { label: 'Mujer embarazada', category: 'consumidores' },
  { label: 'Persona mayor', category: 'consumidores' },
  { label: 'Persona con alergia', category: 'consumidores' },
  { label: 'Lavado de manos', category: 'trabajoSeguro' },
  { label: 'Utensilios limpios', category: 'trabajoSeguro' },
  { label: 'Conservación adecuada', category: 'trabajoSeguro' },
  { label: 'Confianza de los clientes', category: 'establecimiento' },
  { label: 'Buena reputación', category: 'establecimiento' },
  { label: 'Correcto funcionamiento', category: 'establecimiento' },
]

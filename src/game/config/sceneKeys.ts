export const SceneKeys = {
  Boot: 'BootScene',
  Main: 'MainScene',
} as const

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys]

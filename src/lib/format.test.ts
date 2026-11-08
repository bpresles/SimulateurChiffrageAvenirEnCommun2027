import { describe, expect, it } from 'bun:test'
import { fmtMd, fmtNombre, fmtPct } from './format'
import { versCsv } from './csv'

describe('format', () => {
  it('utilise la virgule décimale et un espace avant l’unité', () => {
    expect(fmtMd(157.46, { signe: true })).toBe('+157,5 Md€')
    expect(fmtPct(-5.1)).toBe('-5,1 %')
    expect(fmtNombre(0.0001, 1, true)).toBe('0,0')
  })
  it('csv : BOM, séparateur point-virgule, guillemets échappés', () => {
    const c = versCsv(['a', 'b'], [['x;y', 'dit "oui"']])
    expect(c.startsWith('﻿')).toBe(true)
    expect(c).toContain('"x;y";"dit ""oui"""')
  })
})

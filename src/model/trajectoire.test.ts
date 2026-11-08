import { describe, expect, it } from 'bun:test'
import { calculerTrajectoire, effetProgramme } from './trajectoire'

describe('trajectoire', () => {
  it('le tendanciel garde un déficit de 5,4 % du PIB', () => {
    for (const p of calculerTrajectoire(0, 0, 0)) expect(p.soldePct).toBeCloseTo(-5.4, 9)
  })
  it('effet : 0 en 2026, An 1 en 2027, interpolation puis année pleine dès 2030', () => {
    expect(effetProgramme(2026, 10, 40)).toBe(0)
    expect(effetProgramme(2027, 10, 40)).toBe(10)
    expect(effetProgramme(2028, 10, 40)).toBeCloseTo(20, 9)
    expect(effetProgramme(2029, 10, 40)).toBeCloseTo(30, 9)
    expect(effetProgramme(2030, 10, 40)).toBe(40)
    expect(effetProgramme(2032, 10, 40)).toBe(40)
  })
  it('la dette suit dette_t = dette_{t-1} − solde_t', () => {
    const t = calculerTrajectoire(10, 40, 100)
    expect(t[1].dette).toBeCloseTo(t[0].dette - t[1].solde, 9)
    expect(t[0].detteHorsBcePct).toBeNull()
    expect(t[1].detteHorsBcePct).toBeCloseTo(((t[1].dette - 596.971) / t[1].pib) * 100, 9)
    expect(t[0].dette).toBe(3595)
    expect(t[0].dettePct).toBeCloseTo((3595 / 3000) * 100, 9)
  })
})

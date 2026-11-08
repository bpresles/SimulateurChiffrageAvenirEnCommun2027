import { useEffect, useRef, useState, type RefObject } from 'react'

/** Largeur en pixels de l'élément référencé (ResizeObserver), pour dessiner des SVG à taille réelle. */
export function useLargeurConteneur<T extends HTMLElement>(defaut = 640): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null)
  const [largeur, setLargeur] = useState(defaut)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width)
      if (w > 0) setLargeur(w)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, largeur]
}

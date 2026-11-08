import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
const CLE = 'theme'
const COULEURS: Record<Theme, string> = { light: '#1e3a5f', dark: '#101a29' }

const lireTheme = (): Theme => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')

function choixMemorise(): Theme | null {
  try {
    const v = localStorage.getItem(CLE)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

function appliquer(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', COULEURS[t]))
}

/** Thème clair/sombre : suit le système tant que l'utilisateur n'a pas choisi, puis mémorise son choix. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(lireTheme)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const suivre = (e: MediaQueryListEvent) => {
      if (choixMemorise() === null) {
        const t: Theme = e.matches ? 'dark' : 'light'
        appliquer(t)
        setTheme(t)
      }
    }
    mq.addEventListener('change', suivre)
    return () => mq.removeEventListener('change', suivre)
  }, [])

  const basculer = useCallback(() => {
    const suivant: Theme = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(CLE, suivant)
    } catch {
      /* stockage indisponible : le choix vaut pour la session */
    }
    appliquer(suivant)
    setTheme(suivant)
  }, [theme])

  return { theme, basculer }
}

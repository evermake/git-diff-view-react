import { createContext, useContext } from 'react'

export const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  setTheme: (newTheme: string) => void
}>(
    {
      theme: 'light',
      setTheme: () => {},
    },
    )

export function useTheme() {
  return useContext(ThemeContext)
}

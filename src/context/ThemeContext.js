import { createContext, useState } from 'react';

// Criamos o Megafone
export const ThemeContext = createContext();

// Criamos o Provedor (A caixa que vai abraçar o seu app inteiro)
export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Função que inverte a cor
  function toggleTheme() {
    setIsDarkMode(!isDarkMode);
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
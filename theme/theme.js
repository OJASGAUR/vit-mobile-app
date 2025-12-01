import React from 'react';
import { View } from 'react-native';

export const ThemeContext = React.createContext({});

export function ThemeProvider({ children }) {
  // Minimal theme provider for future extension
  return (
    <ThemeContext.Provider value={{}}>
      <View style={{ flex: 1 }}>{children}</View>
    </ThemeContext.Provider>
  )
}

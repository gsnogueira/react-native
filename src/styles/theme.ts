export const colors = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  error: '#B00020',
  text: '#000000',
  disabled: '#F0F0F0',
  placeholder: '#A1A1A1',
};

export const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

import React from 'react';
export const ThemeContext = React.createContext({ colors, fontSizes, spacing });
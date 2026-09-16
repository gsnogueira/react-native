import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { FinanceProvider } from './FinanceContext';

const App = () => {
  return <FinanceProvider><AppNavigator /></FinanceProvider>;
};

export default App;
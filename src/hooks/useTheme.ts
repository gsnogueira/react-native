import { useContext } from 'react';
import { ThemeContext } from '../styles/theme';

const useTheme = () => {
    const theme = useContext(ThemeContext);
    return theme;
};

export default useTheme;
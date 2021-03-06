import { addDecorator } from '@storybook/react';
import { withThemesProvider } from 'storybook-addon-styled-component-theme';
import { ThemeProvider } from 'styled-components';
import theme from '../../src/threekit/react/theme';

addDecorator(withThemesProvider([theme]), ThemeProvider);

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

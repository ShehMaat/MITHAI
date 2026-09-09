/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1C19',
    textSecondary: '#5A4138',
    background: '#FCF9F4',
    backgroundElement: '#F0EDE9',
    backgroundSelected: '#E5E2DD',
    primary: '#A43700',
    primaryContainer: '#CD4700',
    onPrimary: '#FFFFFF',
    secondary: '#855300',
    secondaryContainer: '#FEA619',
    tertiary: '#006947',
    tertiaryContainer: '#00855B',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F6F3EE',
    surfaceContainer: '#F0EDE9',
    surfaceContainerHigh: '#EBE8E3',
    outline: '#8F7066',
    outlineVariant: '#E3BFB2',
    goldAccent: '#F59E0B',
    saffron: '#E65100',
    pistachio: '#10B981',
  },
  dark: {
    text: '#FCF9F4',
    textSecondary: '#DCDAD5',
    background: '#1A1817',
    backgroundElement: '#2B2624',
    backgroundSelected: '#3D3633',
    primary: '#FFB59A',
    primaryContainer: '#CD4700',
    onPrimary: '#380D00',
    secondary: '#FFB95F',
    secondaryContainer: '#FEA619',
    tertiary: '#4EDEA3',
    tertiaryContainer: '#00855B',
    surfaceContainerLowest: '#141211',
    surfaceContainerLow: '#1E1B19',
    surfaceContainer: '#282422',
    surfaceContainerHigh: '#332E2B',
    outline: '#8F7066',
    outlineVariant: '#5A4138',
    goldAccent: '#F59E0B',
    saffron: '#E65100',
    pistachio: '#10B981',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

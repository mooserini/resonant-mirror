import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.join(__dirname, '..', 'index.css'), 'utf8');

function darkThemeColor(variable: string): string {
  const darkTheme = css.match(/\[data-theme='dark'\]\s*\{([\s\S]*?)\}/)?.[1];
  const value = darkTheme?.match(new RegExp(`${variable}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  if (!value) throw new Error(`Missing dark-theme color: ${variable}`);
  return value;
}

function lightThemeColor(variable: string): string {
  const lightTheme = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1];
  const value = lightTheme?.match(new RegExp(`${variable}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1];
  if (!value) throw new Error(`Missing light-theme color: ${variable}`);
  return value;
}

function relativeLuminance(hex: string): number {
  const channels = hex.slice(1).match(/../g)?.map(value => parseInt(value, 16) / 255);
  if (!channels || channels.length !== 3) throw new Error(`Invalid color: ${hex}`);
  const [red, green, blue] = channels.map(value =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

test('shared identity accent meets WCAG AA contrast in both themes', () => {
  expect(
    contrastRatio(
      lightThemeColor('--rm-identity-accent'),
      lightThemeColor('--bg-secondary')
    )
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    contrastRatio(
      darkThemeColor('--rm-identity-accent'),
      darkThemeColor('--bg-secondary')
    )
  ).toBeGreaterThanOrEqual(4.5);
});

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(scriptDirectory, '../src/assets/images/iden-product-icons');

const iconBodies = Object.freeze({
  'native-app': `
    <rect x="13" y="5.5" width="14" height="29" rx="4" fill="none" stroke="INK" stroke-width="2"/>
    <path d="M17 9h6M18 30.5h4" stroke="MUTED" stroke-width="2" stroke-linecap="round"/>
    <circle cx="28.5" cy="10.5" r="3.5" fill="ACCENT"/>
    <path d="m27 10.5 1 1 2-2" fill="none" stroke="SURFACE" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
  'single-page-app': `
    <rect x="5.5" y="7.5" width="29" height="25" rx="4" fill="none" stroke="INK" stroke-width="2"/>
    <path d="M6 14.5h28M10 11h.1M14 11h.1M18 11h.1" stroke="MUTED" stroke-width="2" stroke-linecap="round"/>
    <path d="m15 20-3 3 3 3M25 20l3 3-3 3M22 18l-4 10" fill="none" stroke="ACCENT" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  'traditional-web-app': `
    <rect x="5.5" y="7.5" width="29" height="25" rx="4" fill="none" stroke="INK" stroke-width="2"/>
    <path d="M6 14.5h28M10 11h.1M14 11h.1M18 11h.1M10 20h10M10 25h14" stroke="MUTED" stroke-width="2" stroke-linecap="round"/>
    <path d="M27 21.5h5v7h-5z" fill="ACCENT"/>
    <path d="M28.5 21.5V20a1 1 0 0 1 2 0v1.5" fill="none" stroke="ACCENT" stroke-width="1.5"/>`,
  'third-party-app': `
    <rect x="6" y="12" width="19" height="21" rx="4" fill="none" stroke="MUTED" stroke-width="2"/>
    <rect x="15" y="6" width="19" height="21" rx="4" fill="SURFACE" stroke="INK" stroke-width="2"/>
    <path d="M21 20 30 11M24 11h6v6" fill="none" stroke="ACCENT" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  'device-flow-app': `
    <rect x="5" y="8" width="23" height="18" rx="3" fill="none" stroke="INK" stroke-width="2"/>
    <path d="M12 31h10M16 26v5" stroke="MUTED" stroke-width="2" stroke-linecap="round"/>
    <rect x="25" y="17" width="10" height="17" rx="3" fill="SURFACE" stroke="ACCENT" stroke-width="2"/>
    <path d="M28.5 21h3M29 30h2" stroke="ACCENT" stroke-width="1.5" stroke-linecap="round"/>`,
  'api-resource': `
    <path d="M11 9 6 13v14l5 4M29 9l5 4v14l-5 4" fill="none" stroke="MUTED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="13" y="10" width="14" height="7" rx="2" fill="none" stroke="INK" stroke-width="2"/>
    <rect x="13" y="23" width="14" height="7" rx="2" fill="none" stroke="INK" stroke-width="2"/>
    <path d="M16.5 13.5h.1M20 13.5h4M16.5 26.5h.1M20 26.5h4" stroke="ACCENT" stroke-width="2" stroke-linecap="round"/>`,
  webhook: `
    <circle cx="11" cy="12" r="4" fill="none" stroke="INK" stroke-width="2"/>
    <circle cx="29" cy="12" r="4" fill="none" stroke="INK" stroke-width="2"/>
    <circle cx="20" cy="29" r="4" fill="none" stroke="ACCENT" stroke-width="2"/>
    <path d="M15 12h10M13 15l5 10M27 15l-5 10" fill="none" stroke="MUTED" stroke-width="2" stroke-linecap="round"/>`,
});

const createSvg = (body, isDark) => {
  const palette = isDark
    ? { SURFACE: '#252831', INK: '#D8DAE3', MUTED: '#858A97', ACCENT: '#8B8CFF' }
    : { SURFACE: '#F4F5F7', INK: '#292C33', MUTED: '#8D919B', ACCENT: '#5B5CF6' };

  const content = Object.entries(palette).reduce(
    (result, [name, color]) => result.replaceAll(name, color),
    body
  );

  return [
    '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
    `  <rect width="40" height="40" rx="8" fill="${palette.SURFACE}"/>`,
    `  ${content.trim()}`,
    '</svg>',
    '',
  ].join('\n');
};

for (const [iconName, body] of Object.entries(iconBodies)) {
  await Promise.all([
    writeFile(path.join(outputDirectory, `${iconName}.svg`), createSvg(body, false)),
    writeFile(path.join(outputDirectory, `${iconName}-dark.svg`), createSvg(body, true)),
  ]);
}

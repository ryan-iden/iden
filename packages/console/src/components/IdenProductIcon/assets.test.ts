import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const productIconsDirectory = path.resolve(
  currentDirectory,
  '../../assets/images/iden-product-icons'
);
const stateIllustrationsDirectory = path.resolve(
  currentDirectory,
  '../../assets/images/iden-states'
);

const rasterProductIcons = [
  'connectors',
  'email',
  'machine-to-machine',
  'management-api',
  'organizations',
  'protected-app',
  'role-access',
  'sign-in-preview',
  'sms',
];

const vectorProductIcons = [
  'api-resource',
  'device-flow-app',
  'native-app',
  'single-page-app',
  'third-party-app',
  'traditional-web-app',
  'webhook',
];

describe('iden art assets', () => {
  it.each([...rasterProductIcons, ...vectorProductIcons])(
    '%s uses paired glacier vectors in the new foundation',
    (name) => {
      const directory = path.resolve(currentDirectory, '../../../../ui-foundation/assets');
      const light = readFileSync(path.join(directory, `${name}.svg`), 'utf8');
      const dark = readFileSync(path.join(directory, `${name}-dark.svg`), 'utf8');
      expect(light).toContain('viewBox="0 0 80 80"');
      expect(dark).toContain('viewBox="0 0 80 80"');
      expect(light).toContain('#007C91');
      expect(dark).toContain('#67E8F9');
      expect(dark).not.toContain('#FFFFFF');
      expect(light).not.toMatch(/#(?:5b5cf6|6139f6)/i);
      expect(dark).not.toMatch(/#(?:5b5cf6|6139f6)/i);
    }
  );

  it.each(rasterProductIcons)('%s has a distinct dark raster asset', (name) => {
    const light = readFileSync(path.join(productIconsDirectory, `${name}.png`));
    const dark = readFileSync(path.join(productIconsDirectory, `${name}-dark.png`));

    expect(light.equals(dark)).toBe(false);
  });

  it.each(vectorProductIcons)('%s has neutral light and dark vector assets', (name) => {
    const light = readFileSync(path.join(productIconsDirectory, `${name}.svg`), 'utf8');
    const dark = readFileSync(path.join(productIconsDirectory, `${name}-dark.svg`), 'utf8');

    expect(light).toContain('#F4F5F7');
    expect(light).toContain('#5B5CF6');
    expect(dark).toContain('#252831');
    expect(dark).toContain('#8B8CFF');
    expect(light).not.toMatch(/#(?:4300da|492ef3|7958ff|cf69ff|f07eff)/i);
    expect(dark).not.toMatch(/#(?:4300da|492ef3|7958ff|cf69ff|f07eff)/i);
  });

  it.each(['empty', 'no-results', 'request-error'])(
    '%s has a distinct dark state illustration',
    (name) => {
      const light = readFileSync(path.join(stateIllustrationsDirectory, `${name}.png`));
      const dark = readFileSync(path.join(stateIllustrationsDirectory, `${name}-dark.png`));

      expect(light.equals(dark)).toBe(false);
    }
  );
});

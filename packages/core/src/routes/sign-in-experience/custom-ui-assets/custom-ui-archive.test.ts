import AdmZip from 'adm-zip';

import { validateCustomUiArchive, validateCustomUiEntryName } from './custom-ui-archive.js';

const createArchive = (...files: ReadonlyArray<readonly [string, string]>) => {
  const archive = new AdmZip();
  for (const [name, content] of files) {
    archive.addFile(name, Buffer.from(content));
  }
  return archive.toBuffer();
};

describe('custom UI archive validation', () => {
  it('requires a root index.html and returns normalized upload data', () => {
    const files = validateCustomUiArchive(
      createArchive(['index.html', '<html></html>'], ['assets/app.js', 'console.log(1)'])
    );
    expect(files.map(({ entryName }) => entryName).toSorted()).toEqual([
      'assets/app.js',
      'index.html',
    ]);
  });

  it('rejects archives without a root index.html', () => {
    expect(() => validateCustomUiArchive(createArchive(['nested/index.html', 'no']))).toThrow();
  });

  it.each(['../secret', '/absolute', 'folder/../../secret', 'folder\\..\\secret'])(
    'rejects unsafe entry path %s',
    (entryName) => {
      expect(() => validateCustomUiEntryName(entryName)).toThrow();
    }
  );
});

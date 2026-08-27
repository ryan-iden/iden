import path from 'node:path';

import AdmZip from 'adm-zip';

import assertThat from '#src/utils/assert-that.js';

const maxEntries = 2000;
const maxExtractedSize = 50 * 1024 * 1024;
const maxEntrySize = 10 * 1024 * 1024;

const contentTypes: Readonly<Record<string, string>> = Object.freeze({
  '.css': 'text/css',
  '.gif': 'image/gif',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
});

export const validateCustomUiEntryName = (entryName: string) => {
  const normalized = entryName.replaceAll('\\', '/');
  const segments = normalized.split('/');
  assertThat(
    normalized.length > 0 &&
      !normalized.startsWith('/') &&
      !normalized.includes('\0') &&
      !segments.includes('..') &&
      !path.isAbsolute(normalized),
    'guard.invalid_input'
  );
  return normalized;
};

export const validateCustomUiArchive = (data: Uint8Array) => {
  const archive = new AdmZip(Buffer.from(data));
  const entries = archive.getEntries();
  assertThat(entries.length > 0 && entries.length <= maxEntries, 'guard.invalid_input');
  const files = entries.flatMap((entry) => {
    const entryName = validateCustomUiEntryName(entry.entryName);
    // eslint-disable-next-line no-bitwise -- ZIP external attributes encode Unix mode bits.
    const unixMode = (entry.attr >>> 16) & 0xff_ff;
    // eslint-disable-next-line no-bitwise -- The file type must be read from the Unix mode mask.
    const isSymbolicLink = (unixMode & 0o17_0000) === 0o12_0000;
    assertThat(!isSymbolicLink, 'guard.invalid_input');
    if (entry.isDirectory) {
      return [];
    }
    assertThat(entry.header.size <= maxEntrySize, 'guard.file_size_exceeded');
    return [
      {
        entryName,
        data: entry.getData(),
        contentType: contentTypes[path.extname(entryName).toLowerCase()],
        size: entry.header.size,
      },
    ];
  });
  const extractedSize = files.reduce((total, { size }) => total + size, 0);
  assertThat(extractedSize <= maxExtractedSize, 'guard.file_size_exceeded');
  assertThat(
    files.some(({ entryName }) => entryName === 'index.html'),
    'guard.invalid_input'
  );
  return files;
};

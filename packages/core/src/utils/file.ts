/**
 * Read a Readable stream to a string
 * @param stream - The Readable stream to read from
 * @returns A promise that resolves to a string containing the stream's data
 */
export async function streamToBuffer(stream?: NodeJS.ReadableStream): Promise<Uint8Array> {
  if (!stream) {
    return Buffer.alloc(0);
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function streamToString(stream?: NodeJS.ReadableStream): Promise<string> {
  const data = await streamToBuffer(stream);
  return Buffer.from(data).toString('utf8');
}

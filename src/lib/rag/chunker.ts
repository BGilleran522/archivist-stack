// Split text into overlapping chunks for embedding. Deliberately simple
// and dependency-free: paragraph-aware, size-bounded, with overlap so a
// fact split across a boundary is still retrievable from both chunks.

export interface ChunkOptions {
  maxChars?: number;   // soft cap per chunk
  overlap?: number;    // chars of tail carried into the next chunk
}

export function chunk(text: string, opts: ChunkOptions = {}): string[] {
  const maxChars = opts.maxChars ?? 1200;
  const overlap = opts.overlap ?? 150;
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  const paras = clean.split(/\n{2,}/);
  const chunks: string[] = [];
  let buf = "";

  const flush = () => {
    if (buf.trim()) chunks.push(buf.trim());
    buf = overlap > 0 ? buf.slice(-overlap) : "";
  };

  for (const p of paras) {
    if ((buf + "\n\n" + p).length > maxChars) flush();
    buf = buf ? buf + "\n\n" + p : p;
    while (buf.length > maxChars) {
      chunks.push(buf.slice(0, maxChars).trim());
      buf = buf.slice(maxChars - overlap);
    }
  }
  flush();
  return chunks.filter(Boolean);
}

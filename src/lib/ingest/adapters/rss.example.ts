import type { IngestAdapter, NormalizedRecord } from "../pipeline";

// EXAMPLE adapter. Shows the two methods any source must implement.
// Parsing is intentionally minimal — swap in a real RSS parser. This
// exists to demonstrate the seam, not to be production-grade.
export const rssAdapter: IngestAdapter = {
  name: "rss",

  async fetch(config): Promise<unknown[]> {
    const url = String(config.url ?? "");
    if (!url) return [];
    const res = await fetch(url);
    const xml = await res.text();
    // naive <item>…</item> split; replace with a real parser
    return xml.split(/<item[>\s]/i).slice(1);
  },

  normalize(raw): NormalizedRecord | null {
    const s = String(raw);
    const pick = (tag: string) =>
      s.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1]?.trim();
    const title = pick("title");
    const link = pick("link") ?? pick("guid");
    if (!title || !link) return null;
    return { dedupeKey: link, title, kind: "rss", metadata: { link } };
  },
};

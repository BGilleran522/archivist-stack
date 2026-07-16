// Embedding provider seam. The template is provider-agnostic: drop in
// your model of choice. Kept behind an interface so swapping providers
// (or dimensions) is a one-file change.

export interface Embedder {
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

// Placeholder. Replace with a real provider call. Throws loudly so you
// can't ship it by accident.
export const embedder: Embedder = {
  dimensions: 1536,
  async embed(): Promise<number[][]> {
    throw new Error(
      "embeddings: no provider wired. Implement Embedder.embed() with your model.",
    );
  },
};

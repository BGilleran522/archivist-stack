# Contributing

This is a template you clone and own, not a framework you depend on. The best
"contribution" is to fork it and build something.

If you do want to send a change upstream: keep it domain-neutral. Anything
product-specific — tuned weights, a real persona voice, a proprietary adapter —
belongs in your own `calibration.ts` and your own fork, never here.

- `npm run typecheck && npm run test` must pass.
- No new runtime dependency without a clear reason; the point is a small,
  legible substrate.
- Keep the IP boundary intact: no real calibration values in the repo.

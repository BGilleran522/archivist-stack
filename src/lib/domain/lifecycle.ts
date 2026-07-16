// Generic lifecycle state machine. A product defines its own status
// values and the legal transitions between them; this module enforces
// them. Keeping transitions data-driven (not scattered `if`s) is what
// let the same code back a job-application pipeline, a build backlog,
// and a customer-outcome tracker.

export type Transitions<S extends string> = Readonly<Record<S, readonly S[]>>;

export class Lifecycle<S extends string> {
  constructor(
    private readonly transitions: Transitions<S>,
    public readonly initial: S,
  ) {}

  can(from: S, to: S): boolean {
    return (this.transitions[from] ?? []).includes(to);
  }

  /** Returns `to` if the move is legal, else throws. */
  assert(from: S, to: S): S {
    if (from === to) return to;
    if (!this.can(from, to)) {
      throw new Error(`illegal transition: ${from} -> ${to}`);
    }
    return to;
  }

  next(from: S): readonly S[] {
    return this.transitions[from] ?? [];
  }

  isTerminal(state: S): boolean {
    return this.next(state).length === 0;
  }
}

// The neutral default that ships with migration 0002. Swap for your
// domain's states + transitions.
export type DefaultStatus = "new" | "active" | "blocked" | "done" | "archived";

export const defaultLifecycle = new Lifecycle<DefaultStatus>(
  {
    new: ["active", "archived"],
    active: ["blocked", "done", "archived"],
    blocked: ["active", "archived"],
    done: ["archived"],
    archived: [],
  },
  "new",
);

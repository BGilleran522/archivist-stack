// Tool registry for the persona\'s agentic turns. A product registers
// named tools; the persona loop dispatches by name. Kept tiny and
// dependency-free — wire it to your AI client\'s tool-calling format.

export interface Tool<A = Record<string, unknown>, R = unknown> {
  name: string;
  description: string;
  run: (args: A) => Promise<R>;
}

export class ToolRegistry {
  private tools = new Map<string, Tool<any, any>>();

  register(tool: Tool<any, any>): this {
    this.tools.set(tool.name, tool);
    return this;
  }

  list(): Tool[] {
    return [...this.tools.values()];
  }

  async dispatch(name: string, args: unknown): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`unknown tool: ${name}`);
    return tool.run(args as Record<string, unknown>);
  }
}

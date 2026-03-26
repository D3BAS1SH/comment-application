import { AsyncLocalStorage } from "node:async_hooks";

export class TraceContext {
    static pocket = new AsyncLocalStorage<string>();

    static run(traceId: string, next: () => void) {
        this.pocket.run(traceId, next);
    }

    static getTraceId(): string | undefined {
        return this.pocket.getStore();
    }
}
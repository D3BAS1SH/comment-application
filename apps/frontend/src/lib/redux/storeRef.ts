import type { AppStore } from './store';

// Mutable container — written once by store.ts, read lazily by api-client.ts.
// Using `import type` ensures zero runtime import is emitted, which is what
// breaks the circular-dependency / TDZ chain.
const storeRef: { current: AppStore | null } = { current: null };

/** Called exactly once, immediately after configureStore() in store.ts. */
export function injectStore(s: AppStore): void {
  storeRef.current = s;
}

export default storeRef;

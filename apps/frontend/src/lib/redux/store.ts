import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  WebStorage,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

// Define the interface for the storage
interface NoopStorage {
  getItem: (_key: string) => Promise<null>;
  setItem: (_key: string, value: unknown) => Promise<unknown>;
  removeItem: (_key: string) => Promise<void>;
}

// Conditional storage for SSR/SSG
const createNoopStorage = (): NoopStorage => {
  return {
    // getItem(key)

    getItem(_key: string) {
      return Promise.resolve(null);
    },
    // setItem(key, value)

    setItem(_key: string, value: unknown) {
      return Promise.resolve(value);
    },
    // removeItem(key)

    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Prefer localStorage if available, else use noop
const storage: WebStorage | NoopStorage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();

// Persist config – you can whitelist only the "auth" slice
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // persist the "user" slice only
};

// Combine your reducers, and wrap with persistReducer
const rootReducer = {
  user: userReducer, // slice name is 'user' in userSlice.ts
  // add more slices as needed, e.g. post: postReducer
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers(rootReducer)
);

// Create the store once as a singleton
const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// For backwards compatibility with existing code
export const makeStore = () => store;

// Required for PersistGate in your _app.tsx or root layout
export const persistor = persistStore(store);

// Type exports for hooks
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store as default for direct imports
export default store;

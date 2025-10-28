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
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage

// Persist config – you can whitelist only the "auth" slice
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // persist the "auth" slice only (call it 'user' if that's the state key)
};

// Combine your reducers, and wrap with persistReducer
const rootReducer = {
  auth: userReducer, // add more slices as needed, e.g. post: postReducer
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

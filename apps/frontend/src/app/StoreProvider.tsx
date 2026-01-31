'use client';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore, persistor } from '../lib/redux/store';
import { PersistGate } from 'redux-persist/integration/react';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use useState with a lazy initializer to ensure the store is created exactly once
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

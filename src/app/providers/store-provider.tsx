"use client";

import * as React from "react";
import { Provider } from "react-redux";

import {
  type AppStore,
  makeStore,
  type PreloadedStoreState,
} from "shared/lib/store/store";

function StoreProvider({
  children,
  preloadedState,
}: Readonly<{
  children: React.ReactNode;
  preloadedState: PreloadedStoreState;
}>) {
  const storeRef = React.useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedState);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export { StoreProvider };

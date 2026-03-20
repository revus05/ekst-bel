import { combineReducers, configureStore } from "@reduxjs/toolkit";

import { userReducer } from "entities/user/model/user-slice";
import { themeReducer } from "shared/model/theme/theme-slice";

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
});

type RootState = ReturnType<typeof rootReducer>;
type PreloadedStoreState = Partial<RootState>;

function makeStore(preloadedState?: PreloadedStoreState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState | undefined,
  });
}

type AppStore = ReturnType<typeof makeStore>;
type AppDispatch = AppStore["dispatch"];

export type { AppDispatch, AppStore, PreloadedStoreState, RootState };
export { makeStore };

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_THEME, type ThemeMode } from "shared/lib/theme/constants";

type ThemeState = {
  value: ThemeMode;
};

const initialState: ThemeState = {
  value: DEFAULT_THEME,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.value = action.payload;
    },
  },
});

const { setTheme } = themeSlice.actions;
const themeReducer = themeSlice.reducer;

export type { ThemeState };
export { setTheme, themeReducer };

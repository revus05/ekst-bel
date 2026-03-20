import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { User } from "entities/user/model/types";

type UserState = {
  currentUser: User | null;
};

const initialState: UserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
    clearUser(state) {
      state.currentUser = null;
    },
  },
});

const { clearUser, setUser } = userSlice.actions;
const userReducer = userSlice.reducer;

const selectCurrentUser = (state: { user: UserState }) =>
  state.user.currentUser;

export type { UserState };
export { clearUser, selectCurrentUser, setUser, userReducer };

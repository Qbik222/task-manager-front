// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import columnsReducer from "./reducers/columnSlice.ts";

export interface RootState {
  auth: AuthState;
  columns: ColumnsState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    columns: columnsReducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['auth/login'],
          ignoredPaths: ['auth.tokens']
        },
      }),
});

export type AppDispatch = typeof store.dispatch;
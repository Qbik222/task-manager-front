// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/auth.slice.ts";
import columnsReducer from "./reducers/column.slice.ts";

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
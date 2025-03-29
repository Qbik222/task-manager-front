import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";

// Визначаємо тип для токенів
interface Tokens {
  access: string | null;
  refresh: string | null;
}

// Визначаємо тип для стану автентифікації
export interface AuthState {
  user: {
    username: string;
  } | null;
  tokens: Tokens;
  isAuthenticated: boolean;
}

// Тип для всього стану Redux
export interface RootState {
  auth: AuthState;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['auth/login'],
          ignoredPaths: ['auth.tokens']
        },
      }),
});

// Експортуємо типізовані хуки для використання в компонентах
export type AppDispatch = typeof store.dispatch;
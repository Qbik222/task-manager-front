import { createBrowserRouter, Navigate } from "react-router-dom";
import { store } from "./store/store.ts";
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import { ReactNode } from "react";

// Тип для стану автентифікації
interface AuthState {
  auth: {
    tokens: {
      access?: string;
      refresh?: string;
    } | null;
  };
}

// Функція для перевірки автентифікації
const checkAuth = (): boolean => {
  const state = store.getState() as AuthState;
  return !!state.auth.tokens?.access;
};

// Типи для пропсів захищених роутів
interface ProtectedRouteProps {
  children: ReactNode;
}

interface PublicRouteProps {
  children: ReactNode;
}

// Захищений роут
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return checkAuth() ? children : <Navigate to="/login" replace />;
};

// Публічний роут (тільки для неавторизованих)
const PublicRoute = ({ children }: PublicRouteProps) => {
  return checkAuth() ? <Navigate to="/home" replace /> : children;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: checkAuth() ? (
        <Navigate to="/home" replace />
    ) : (
        <Navigate to="/login" replace />
    ),
  },
  {
    path: "/home",
    element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
        <PublicRoute>
          <Login />
        </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
        <PublicRoute>
          <Register />
        </PublicRoute>
    ),
  },
]);
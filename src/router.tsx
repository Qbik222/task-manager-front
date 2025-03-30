import { createBrowserRouter, Navigate } from "react-router-dom";
import { store } from "./store/store.ts";
import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import { ReactNode } from "react";
import AuthInitializer from "./components/authinit/AuthInitializer.tsx";
import Project from "./components/project/Project.tsx";

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

// Обгортка для роутів з AuthInitializer
const RouteWrapper = ({ children }: { children: ReactNode }) => (
    <AuthInitializer>{children}</AuthInitializer>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
        <RouteWrapper>
          {checkAuth() ? (
              <Navigate to="/home" replace />
          ) : (
              <Navigate to="/login" replace />
          )}
        </RouteWrapper>
    ),
  },
  {
    path: "/home",
    element: (
        <RouteWrapper>
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </RouteWrapper>
    ),
  },
  {
    path: "/login",
    element: (
        <RouteWrapper>
          <PublicRoute>
            <Login />
          </PublicRoute>
        </RouteWrapper>
    ),
  },
  {
    path: "/register",
    element: (
        <RouteWrapper>
          <PublicRoute>
            <Register />
          </PublicRoute>
        </RouteWrapper>
    ),
  },
    {
        path: "/projects/:projectName",
        element: (
            <RouteWrapper>
                <ProtectedRoute>
                    <Project />
                </ProtectedRoute>
            </RouteWrapper>
        ),
    }
]);
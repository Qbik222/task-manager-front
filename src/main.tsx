import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { router } from "./router";
import AuthInitializer from "./components/authinit/AuthInitializer.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <AuthInitializer>
                <RouterProvider router={router} />
            </AuthInitializer>
        </Provider>
    </StrictMode>
);
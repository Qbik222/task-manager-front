import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    username: string;
}

interface AuthState {
    user: User | null;
    tokens: {
        access: string | null;
        // refresh?: string | null;
    };
    isAuthenticated: boolean;
}

// Функція для синхронізованого завантаження стану
const loadInitialState = (): AuthState => {
    // Спершу перевіряємо localStorage
    const localStorageUsername = localStorage.getItem('username');
    const accessToken = localStorage.getItem('accessToken');

    // Якщо є дані в localStorage - використовуємо їх
    if (localStorageUsername && accessToken) {
        return {
            user: { username: localStorageUsername },
            tokens: { access: accessToken },
            isAuthenticated: true
        };
    }

    // Якщо немає даних в localStorage - пустий стан
    return {
        user: null,
        tokens: { access: null },
        isAuthenticated: false
    };
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{
            user: User;
            tokens: { access: string; refresh?: string }
        }>) => {
            // Синхронізуємо Redux та localStorage
            state.user = action.payload.user;
            state.tokens.access = action.payload.tokens.access;
            state.isAuthenticated = true;

            localStorage.setItem('username', action.payload.user.username);
            localStorage.setItem('accessToken', action.payload.tokens.access);

            // if (action.payload.tokens.refresh) {
            //     state.tokens.refresh = action.payload.tokens.refresh;
            //     localStorage.setItem('refreshToken', action.payload.tokens.refresh);
            // }
        },
        logout: (state) => {
            // Очищаємо обидва джерела
            state.user = null;
            state.tokens = { access: null };
            state.isAuthenticated = false;

            localStorage.removeItem('username');
            localStorage.removeItem('accessToken');
            // localStorage.removeItem('refreshToken');
        },
        syncAuthState: (state) => {
            // Синхронізація при завантаженні додатку
            const localStorageUsername = localStorage.getItem('username');
            const accessToken = localStorage.getItem('accessToken');

            if (localStorageUsername && accessToken) {
                // Якщо в localStorage є дані, а в Redux немає
                if (!state.user || !state.tokens.access) {
                    state.user = { username: localStorageUsername };
                    state.tokens.access = accessToken;
                    state.isAuthenticated = true;
                }
            } else if (!localStorageUsername && state.user) {
                // Якщо в Redux є дані, а в localStorage немає
                localStorage.setItem('username', state.user.username);
            }
        }
    }
});

export const { login, logout, syncAuthState } = authSlice.actions;
export default authSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    username: string;
    userId: string;
}

interface AuthState {
    user: User | null;
    tokens: {
        access: string | null;
    };
    isAuthenticated: boolean;
}

const loadInitialState = (): AuthState => {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('accessToken');

    if (username && userId && accessToken) {
        return {
            user: { username, userId },
            tokens: { access: accessToken },
            isAuthenticated: true
        };
    }

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
            state.user = action.payload.user;
            state.tokens.access = action.payload.tokens.access;
            state.isAuthenticated = true;

            localStorage.setItem('username', action.payload.user.username);
            localStorage.setItem('userId', action.payload.user.userId);
            localStorage.setItem('accessToken', action.payload.tokens.access);
        },
        logout: (state) => {
            state.user = null;
            state.tokens = { access: null };
            state.isAuthenticated = false;

            localStorage.removeItem('username');
            localStorage.removeItem('userId');
            localStorage.removeItem('accessToken');
        },
        syncAuthState: (state) => {
            const username = localStorage.getItem('username');
            const userId = localStorage.getItem('userId');
            const accessToken = localStorage.getItem('accessToken');

            if (username && userId && accessToken) {
                if (!state.user || !state.tokens.access) {
                    state.user = { username, userId };
                    state.tokens.access = accessToken;
                    state.isAuthenticated = true;
                }
            } else if (state.user && (!username || !userId)) {
                localStorage.setItem('username', state.user.username);
                localStorage.setItem('userId', state.user.userId);
            }
        }
    }
});

export const { login, logout, syncAuthState } = authSlice.actions;
export default authSlice.reducer;

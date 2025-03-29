import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { login, syncAuthState } from '../../store/reducers/authSlice.ts';
import { verifyToken } from '../../services/api.ts';
import { AppDispatch } from '../../store/store.ts';

// interface UserData {
//     username: string;
// }

interface AuthInitializerProps {
    children: ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
    const dispatch: AppDispatch = useDispatch();

    useEffect(() => {
        const initializeAuth = async () => {
            // Спочатку синхронізуємо стан між localStorage і Redux
            dispatch(syncAuthState());

            const accessToken = localStorage.getItem('accessToken');
            const localStorageUsername = localStorage.getItem('username');

            if (accessToken) {
                try {
                    // Перевіряємо токен на сервері
                    // const userData = verifyToken(accessToken);
                    const userData = true;

                    // Оновлюємо Redux стан
                    dispatch(login({
                        user: {
                            username: localStorageUsername || 'guest'
                        },
                        tokens: {
                            access: accessToken,
                            refresh: localStorage.getItem('refreshToken') || undefined
                        }
                    }));

                    // Додатково синхронізуємо username
                    if (userData.username && !localStorageUsername) {
                        localStorage.setItem('username', userData.username);
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Якщо токен невалідний - очищаємо
                    // localStorage.removeItem('accessToken');
                    // localStorage.removeItem('refreshToken');
                    // Але username може залишитись
                }
            } else if (localStorageUsername) {
                // Якщо немає токена, але є username - очищаємо
                localStorage.removeItem('username');
            }
        };

        initializeAuth();
    }, [dispatch]);

    return <>{children}</>;
}
import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import {login, logout, syncAuthState} from '../../store/reducers/auth.slice.ts';
import { verifyToken } from '../../services/api.ts';
import { AppDispatch } from '../../store/store.ts';
import {useNavigate} from "react-router-dom";

// interface UserData {
//     username: string;
// }

interface AuthInitializerProps {
    children: ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
    const dispatch: AppDispatch = useDispatch();

    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            // Спочатку синхронізуємо стан між localStorage і Redux
            dispatch(syncAuthState());

            const accessToken = localStorage.getItem('accessToken');
            const localStorageUsername = localStorage.getItem('username');

            if (accessToken) {
                try {
                    // Перевіряємо токен на сервері
                    const userAuth = await verifyToken(accessToken);

                    console.log(userAuth)

                    if(userAuth){
                        dispatch(login({
                            user: {
                                username: localStorageUsername || 'guest'
                            },
                            tokens: {
                                access: accessToken,
                            }
                        }));
                        dispatch(syncAuthState());
                    }else{
                        dispatch(logout());
                        dispatch(syncAuthState());
                        navigate("/login")
                    }

                } catch (error) {
                    console.error('Token verification failed:', error);
                    // Якщо токен невалідний - очищаємо
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    // Але username може залишитись
                }
            } else if (localStorageUsername) {
                // Якщо немає токена, але є username - очищаємо
                localStorage.removeItem('username');
            }
        };

        initializeAuth();
    }, [dispatch, navigate]);

    return <>{children}</>;
}
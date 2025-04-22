import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { login, logout, syncAuthState } from '../../store/reducers/auth.slice.ts';
import { verifyToken } from '../../services/api.ts';
import { AppDispatch } from '../../store/store.ts';
import { useNavigate } from 'react-router-dom';

interface AuthInitializerProps {
    children: ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            dispatch(syncAuthState());

            const accessToken = localStorage.getItem('accessToken');
            const localStorageUsername = localStorage.getItem('username');
            const localStorageUserId = localStorage.getItem('userId');

            if (accessToken) {
                try {
                    const userAuth = await verifyToken(accessToken);

                    if (userAuth) {
                        dispatch(login({
                            user: {
                                username: localStorageUsername || 'guest',
                                userId: localStorageUserId || 'unknown',
                            },
                            tokens: {
                                access: accessToken,
                            }
                        }));
                        dispatch(syncAuthState());
                    } else {
                        dispatch(logout());
                        dispatch(syncAuthState());
                        navigate("/login");
                    }

                } catch (error) {
                    console.error('Token verification failed:', error);

                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userId');
                }
            } else if (localStorageUsername || localStorageUserId) {
                localStorage.removeItem('username');
                localStorage.removeItem('userId');
            }
        };

        initializeAuth();
    }, [dispatch, navigate]);

    return <>{children}</>;
}

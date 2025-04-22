import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../store/reducers/auth.slice.ts";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/api.ts";
import styles from './Login.module.sass';

export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await loginUser(formData);
            console.log('Server response after login:', response);

            const { access, refresh, user_id } = response;

            console.log(user_id)

            const username = formData.username;
            const userId = user_id

            localStorage.setItem('accessToken', access);
            localStorage.setItem('username', username);
            localStorage.setItem('userId', user_id);


            dispatch(login({
                user: { username, userId },
                tokens: {
                    access,
                }
            }));

            navigate("/home");
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.response?.data?.message || "Login failed. Please try again.");
            localStorage.removeItem('accessToken');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleLogin} className={styles.form}>
                <h1 className={styles.title}>Login</h1>

                {error && <div className={styles.error}>{error}</div>}

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    disabled={isLoading}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.input}
                    required
                    disabled={isLoading}
                    minLength={6}
                />

                <button
                    type="submit"
                    className={styles.button}
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
            <Link to="/register" className={styles.registerButton}>
                Create new account
            </Link>
        </div>
    );
}

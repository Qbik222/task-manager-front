import { useState } from 'react';
import { registerUser, loginUser } from '../../services/api.ts';
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { login } from '../../store/reducers/auth.slice.ts';
import styles from './Register.module.sass';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // 1. Реєстрація користувача
            const registrationResult = await registerUser(formData);
            console.log('User registered:', registrationResult);

            // 2. Автоматичний логін після реєстрації
            const loginResponse = await loginUser({
                username: formData.username,
                password: formData.password
            });

            // 3. Зберігаємо токени в Redux та localStorage
            const { access, refresh } = loginResponse;
            dispatch(login({
                user: { username: formData.username },
                tokens: { access, refresh }
            }));

            // 4. Перенаправляємо на головну сторінку
            navigate("/home");

        } catch (error) {
            console.error('Registration failed:', error);
            setError(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Sign Up</h2>

                {error && <div className={styles.error}>{error}</div>}

                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                    className={styles.input}
                    disabled={isLoading}
                />

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className={styles.input}
                    disabled={isLoading}
                />

                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className={styles.input}
                    disabled={isLoading}
                    minLength={6}
                />

                <button
                    type="submit"
                    className={styles.button}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Register'}
                </button>
            </form>
            <Link to="/login" className={styles.loginButton}>
                Already have an account? Login
            </Link>
        </div>
    );
};

export default Register;
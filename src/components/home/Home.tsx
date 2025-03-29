import styles from './home.module.sass';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store.ts';
import { useState, useRef, useEffect } from 'react';
import { logout } from '../../store/reducers/authSlice';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa'; // Додано іконку хрестика

const Home = () => {
    const username = useSelector((state: RootState) => state.auth.user?.username);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userContainerRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleCloseDropdown = () => {
        setShowDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                userContainerRef.current &&
                !userContainerRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.home}>
            <main className={styles.main}>
                <div className={styles.projects}>
                    <h1 className={styles.title}>my projects</h1>
                    <div className={styles.projectWrap}>
                        <div className={styles.projectCard}>
                            <h2 className={styles.projectTitle}>project1</h2>
                        </div>
                    </div>
                </div>

                <div className={styles.newProjectWrapper}>
                    <h2>create new project</h2>
                    <button className={styles.newProjectButton}>+</button>
                </div>
            </main>

            {username && (
                <div
                    className={styles.userContainer}
                    onMouseEnter={() => setShowDropdown(true)}
                    ref={userContainerRef}
                >
                    <div className={styles.user}>
                        <span>{username}</span>
                    </div>

                    {showDropdown && (
                        <div
                            className={styles.dropdownMenu}
                            ref={dropdownRef}
                        >
                            <div
                                className={styles.closeButton}
                                onClick={handleCloseDropdown}
                            >
                                <FaTimes /> {/* Іконка хрестика */}
                            </div>
                            <button
                                className={styles.dropdownItem}
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                            <button
                                className={styles.dropdownItem}
                            >
                                button
                            </button>
                            <button
                                className={styles.dropdownItem}
                            >
                                button
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;
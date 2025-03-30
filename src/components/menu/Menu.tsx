// components/Menu.tsx
import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store.ts';
import { logout } from '../../store/reducers/authSlice.ts';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaBars, FaHome, FaProjectDiagram, FaCog, FaUser, FaChevronDown } from 'react-icons/fa';
import styles from './menu.module.sass';
import { getProjects } from '../../services/api.ts';

interface Project {
    id: number;
    name: string;
    description: string;
    users: number[];
}

const Menu = () => {
    const username = useSelector((state: RootState) => state.auth.user?.username);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [showUsernameTooltip, setShowUsernameTooltip] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const projectsDropdownRef = useRef<HTMLDivElement>(null);
    const projectsButtonRef = useRef<HTMLButtonElement>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleUserDropdown = () => {
        setShowDropdown(prev => !prev);
    };

    const handleCloseDropdown = () => {
        setShowDropdown(false);
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
        if (!isSidebarExpanded) {
            setProjectsDropdownOpen(false);
        }
    };

    const toggleProjectsDropdown = () => {
        if (!isSidebarExpanded) {
            setIsSidebarExpanded(true);
            setTimeout(() => setProjectsDropdownOpen(true), 100);
        } else {
            setProjectsDropdownOpen(prev => !prev);
        }
    };

    const navigateToHome = () => {
        navigate('/home');
    };

    const handleProjectClick = (projectId: number, projectName: string) => {
        const formattedName = projectName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '');
        navigate(`/projects/${formattedName}?id=${projectId}`);
        setProjectsDropdownOpen(false);
    };

    const fetchProjects = async () => {
        try {
            setProjectsLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No authentication token found');

            const projectsData = await getProjects(token);
            setProjects(projectsData);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        if (projectsDropdownOpen) {
            fetchProjects();
        }
    }, [projectsDropdownOpen]);

    useEffect(() => {
        if (!isSidebarExpanded) {
            setProjectsDropdownOpen(false);
        }
    }, [isSidebarExpanded]);

    if (!username) return null;

    return (
        <div className={styles.menuWrapper}>
            <div className={styles.leftRow}>
                <div className={`${styles.sidebar} ${isSidebarExpanded ? styles.expanded : ''}`}>
                    <button className={styles.burgerButton} onClick={toggleSidebar}>
                        <FaBars />
                    </button>

                    <div className={styles.sidebarItems}>
                        <button
                            className={styles.sidebarItem}
                            onClick={navigateToHome}
                        >
                            {isSidebarExpanded ? (
                                <>
                                    <FaHome className={styles.icon} />
                                    <span>Home</span>
                                </>
                            ) : (
                                <FaHome className={styles.icon} />
                            )}
                        </button>

                        <div className={styles.projectsMenuItem}>
                            <button
                                ref={projectsButtonRef}
                                className={styles.sidebarItem}
                                onClick={toggleProjectsDropdown}
                            >
                                {isSidebarExpanded ? (
                                    <>
                                        <FaProjectDiagram className={styles.icon} />
                                        <span>Projects</span>
                                        <FaChevronDown className={`${styles.chevron} ${projectsDropdownOpen ? styles.rotated : ''}`} />
                                    </>
                                ) : (
                                    <FaProjectDiagram className={styles.icon} />
                                )}
                            </button>

                            {projectsDropdownOpen && (
                                <div className={styles.projectsDropdown} ref={projectsDropdownRef}>
                                    {projectsLoading ? (
                                        <div className={styles.dropdownItem}>Loading...</div>
                                    ) : projects.length === 0 ? (
                                        <div className={styles.dropdownItem}>No projects</div>
                                    ) : (
                                        projects.map((project) => (
                                            <button
                                                key={project.id}
                                                className={styles.dropdownItem}
                                                onClick={() => handleProjectClick(project.id, project.name)}
                                            >
                                                {project.name}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <button className={styles.sidebarItem}>
                            {isSidebarExpanded ? (
                                <>
                                    <FaUser className={styles.icon} />
                                    <span>Profile</span>
                                </>
                            ) : (
                                <FaUser className={styles.icon} />
                            )}
                        </button>

                        <button className={styles.sidebarItem}>
                            {isSidebarExpanded ? (
                                <>
                                    <FaCog className={styles.icon} />
                                    <span>Settings</span>
                                </>
                            ) : (
                                <FaCog className={styles.icon} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.topRow}>
                <div className={styles.userContainer}>
                    <div
                        className={styles.userAvatarWrapper}
                        onMouseEnter={() => setShowUsernameTooltip(true)}
                        onMouseLeave={() => setShowUsernameTooltip(false)}
                        onClick={toggleUserDropdown}
                    >
                        <div className={styles.userAvatar}>
                            {username?.charAt(0).toUpperCase()}
                        </div>
                        {showUsernameTooltip && (
                            <div className={styles.usernameTooltip}>
                                {username}
                            </div>
                        )}
                    </div>

                    {showDropdown && (
                        <div className={styles.dropdownMenu} ref={dropdownRef}>
                            <div className={styles.closeButton} onClick={handleCloseDropdown}>
                                <FaTimes />
                            </div>
                            <div className={styles.username}>{username}</div>
                            <button className={styles.dropdownItem} onClick={handleLogout}>
                                Logout
                            </button>
                            <button className={styles.dropdownItem}>
                                Profile
                            </button>
                            <button className={styles.dropdownItem}>
                                Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Menu;
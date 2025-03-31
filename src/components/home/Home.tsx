import styles from './home.module.sass';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store.ts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, getTasks } from '../../services/api.ts';
import Menu from '../menu/Menu.tsx';

const Home = () => {
    const username = useSelector((state: RootState) => state.auth.user?.username);
    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        try {
            setProjectsLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No authentication token found');

            const projectsData = await getProjects(token);
            setProjects(projectsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
            console.error('Error fetching projects:', err);
        } finally {
            setProjectsLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            setTasksLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No authentication token found');

            const tasksData = await getTasks(token);
            setTasks(tasksData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
            console.error('Error fetching tasks:', err);
        } finally {
            setTasksLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchProjects(), fetchTasks()]);
        };
        fetchData();
    }, []);

    const handleProjectClick = (projectId: number, projectName: string) => {
        const formattedName = projectName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '');
        navigate(`/projects/${formattedName}?id=${projectId}`);
    };

    // Get current date
    const currentDate = new Date();
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()];
    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentDate.getMonth()];
    const formattedDate = `${dayOfWeek}, ${currentDate.getDate()} ${month}`;

    return (
        <div className={styles.home}>
            {username && <Menu />}
            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Main</h1>
                    <div className={styles.greeting}>Good afternoon, {username}</div>
                    <div className={styles.date}>{formattedDate}</div>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>My week</span>
                        <div className={styles.statValues}>
                            <span>{tasks.filter(t => t.is_complete).length} tasks completed</span>
                        </div>
                    </div>
                </div>

                <div className={styles.sections}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>My tasks <span className={styles.redDot}>🔴</span></h3>
                        <div className={styles.taskStatus}>Upcoming ({tasks.filter(t => !t.is_complete).length})</div>
                        <div className={styles.taskStatus}>Completed ({tasks.filter(t => t.is_complete).length})</div>

                        <ul className={styles.taskList}>
                            {tasksLoading ? (
                                <div>Loading tasks...</div>
                            ) : error ? (
                                <div>Error: {error}</div>
                            ) : tasks.length === 0 ? (
                                <div>No tasks found</div>
                            ) : (
                                tasks.map((task) => (
                                    <li
                                        key={task.id}
                                        className={styles.taskItem}
                                    >
                                        {task.title}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.subtitle}>My projects</div>

                        {projectsLoading ? (
                            <div>Loading projects...</div>
                        ) : error ? (
                            <div>Error: {error}</div>
                        ) : projects.length === 0 ? (
                            <div>No projects found</div>
                        ) : (
                            <ul className={styles.projectList}>
                                {projects.map((project) => (
                                    <li
                                        key={project.id}
                                        className={styles.projectListItem}
                                        onClick={() => handleProjectClick(project.id, project.name)}
                                    >
                                        {project.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
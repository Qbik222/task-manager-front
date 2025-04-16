import styles from './home.module.sass';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store.ts';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {getProjects, getTasks} from '../../services/api.ts';
import Menu from '../menu/Menu.tsx';
// import ProjectWebSocket from '../../services/websockets/projectSocket.ts';

type Project = {
    id: number;
    name: string;
};

type Task = {
    id: number;
    title: string;
    is_complete: boolean;
};

const Home = () => {
    const username = useSelector((state: RootState) => state.auth.user?.username);
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const socketRef = useRef<ProjectWebSocket | null>(null);

    // // Обробник повідомлень WebSocket
    // const handleSocketMessage = useCallback((message: WebSocketMessage) => {
    //     console.log('WebSocket message received:', message); // Додано логування
    //
    //     switch (message.type) {
    //         case 'INITIAL_PROJECTS':
    //             console.log('Initial projects data:', message.payload);
    //             setProjects(message.payload);
    //             setProjectsLoading(false);
    //             break;
    //         case 'PROJECT_ADDED':
    //             console.log('Project added:', message.payload);
    //             setProjects(prev => [...prev, message.payload]);
    //             break;
    //         case 'PROJECT_UPDATED':
    //             console.log('Project updated:', message.payload);
    //             setProjects(prev => prev.map(p =>
    //                 p.id === message.payload.id ? message.payload : p
    //             ));
    //             break;
    //         case 'PROJECT_DELETED':
    //             console.log('Project deleted:', message.payload);
    //             setProjects(prev => prev.filter(p => p.id !== message.payload.id));
    //             break;
    //         default:
    //             console.warn('Unknown message type:', message.type, 'with payload:', message.payload);
    //     }
    // }, []);
    //
    // // Ініціалізація WebSocket з'єднання
    // useEffect(() => {
    //     const token = localStorage.getItem('accessToken');
    //     if (!token) {
    //         setError('No authentication token found');
    //         return;
    //     }
    //
    //     // Створюємо екземпляр WebSocket для всіх проектів (projectId = 0 або інше значення)
    //     socketRef.current = new ProjectWebSocket(2, {
    //         onMessage: handleSocketMessage,
    //         onError: (err) => setError(err),
    //         onConnect: () => console.log('WebSocket connected'),
    //         onDisconnect: () => console.log('WebSocket disconnected')
    //     });
    //
    //     socketRef.current.connect();
    //
    //     return () => {
    //         socketRef.current?.disconnect();
    //     };
    // }, [handleSocketMessage]);

    const fetchTasks = async () => {
        try {
            setTasksLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No authentication token found');

            const tasksData = await getTasks(token);
            console.log(tasksData)

            setTasks(tasksData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
            console.error('Error fetching tasks:', err);
        } finally {
            setTasksLoading(false);
        }
    };
    const fetchProjects = async () => {
        try {
            setProjectsLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No authentication token found');

            const projectsData = await getProjects(token);
            console.log(projectsData)

            setProjects(projectsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
            console.error('Error fetching projects:', err);
        } finally {
            setProjectsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchProjects();
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
                                       <span>{task.title}</span>
                                       {/*<span> from project ({projects.})</span>*/}
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
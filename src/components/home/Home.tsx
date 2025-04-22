import styles from './home.module.sass';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store.ts';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {getProjects, getTasks} from '../../services/api.ts';
import Menu from '../menu/Menu.tsx';
import { CreateProject } from "../createProject/createProject.tsx"
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
    const [openModal, setOpenModal] = useState(false)
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
        const fetchTasksAndProjects = async () => {
            await fetchTasks();
            await fetchProjects();
        };

        fetchTasksAndProjects();

    }, []);

    useEffect(() => {
        const closeModalOutside = (event: MouseEvent) => {
            const modal = document.querySelector(`.${styles.modalWindow}`)
            const modalOpenBtn = document.querySelector(`.${styles.projectAdd}`)
            if(event.target === modalOpenBtn){
                return
            }else{
                if (openModal && modal && !(event.target as HTMLElement).closest(`.${styles.modalWindow}`)) {
                    setOpenModal(false);
                    console.log("Modal closed");
                }
            }
        };
        document.addEventListener('click', closeModalOutside);
        return () => {
            document.removeEventListener('click', closeModalOutside);
        };
    }, [openModal]);




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
                        <div className={styles.sectionTop}>
                            <div className={styles.subtitle}>My projects</div>
                            <button className={styles.projectAdd} onClick={() =>{ setOpenModal(true)}} >create project</button>
                        </div>


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
            <div className={`${styles.modalWindow} ${openModal ? styles.showModal : ''}`}
                 onClick={(e) => {
                     if (e.target === e.currentTarget) {
                         setOpenModal(false);
                     }
                 }}
            >
                <CreateProject />
                <button
                    className={styles.closeModal}
                    onClick={() => setOpenModal(false)}
                >
                    Close
                </button>
            </div>

        </div>
    );
};

export default Home;
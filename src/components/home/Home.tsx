// Home.tsx
import styles from './home.module.sass';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store.ts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../services/api.ts';
import Menu from '../menu/Menu.tsx'

const Home = () => {
    const username = useSelector((state: RootState) => state.auth.user?.username);
    const navigate = useNavigate();

    interface Project {
        id: number;
        name: string;
        description: string;
        users: number[];
    }

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No authentication token found');

            const projectsData = await getProjects(token);
            setProjects(projectsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleProjectClick = (projectId: number, projectName: string) => {
        const formattedName = projectName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '');
        navigate(`/projects/${formattedName}?id=${projectId}`);
    };

    return (
        <div className={styles.home}>
            <main className={styles.main}>
                {username && <Menu />}
                <div className={styles.projects}>
                    <h1 className={styles.title}>my projects</h1>
                    {loading ? (
                        <div>Loading projects...</div>
                    ) : error ? (
                        <div>Error: {error}</div>
                    ) : projects.length === 0 ? (
                        <div>No projects found</div>
                    ) : (
                        projects.map((project) => (
                            <div
                                key={project.id}
                                className={styles.projectWrap}
                                onClick={() => handleProjectClick(project.id, project.name)}
                            >
                                <div className={styles.projectCard}>
                                    <h2 className={styles.projectTitle}>{project.name}</h2>
                                    {/*<p className={styles.projectDescription}>{project.description}</p>*/}
                                    <div className={styles.projectUsers}>
                                        Participants: {project.users.length}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className={styles.newProjectWrapper}>
                    <h2>create new project</h2>
                    <button className={styles.newProjectButton}>+</button>
                </div>
            </main>


        </div>
    );
};

export default Home;
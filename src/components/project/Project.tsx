import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProjectById } from '../../services/api.ts';
import styles from './Project.module.sass';
import { FaArrowLeft, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import Menu from '../menu/Menu.tsx';

interface Project {
    id: number;
    name: string;
    description: string;
    users: { id: number; username: string }[];
    created_at: string;
}

const Project = () => {
    const { projectName } = useParams<{ projectName: string }>();
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');
                if (!token) throw new Error('No authentication token found');
                if (!projectId) throw new Error('Project ID not provided');

                const projectData = await getProjectById(token, parseInt(projectId));
                setProject(projectData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch project');
                console.error('Error fetching project:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    const handleBack = () => {
        navigate('/');
    };

    // Skeleton loader components
    const ProjectTitleSkeleton = () => (
        <div className={styles.skeletonTitle}></div>
    );

    const ProjectDescriptionSkeleton = () => (
        <div className={styles.skeletonText} style={{ width: '80%' }}></div>
    );

    const ProjectMetaSkeleton = () => (
        <div className={styles.skeletonText} style={{ width: '40%' }}></div>
    );

    const UserCardSkeleton = () => (
        <div className={styles.userCard}>
            <div className={`${styles.userAvatar} ${styles.skeletonAvatar}`}></div>
            <div className={`${styles.userName} ${styles.skeletonText}`} style={{ width: '60px' }}></div>
        </div>
    );

    const TaskPlaceholderSkeleton = () => (
        <div className={styles.taskPlaceholder}>
            <div className={styles.skeletonText} style={{ width: '100%', height: '100px' }}></div>
        </div>
    );

    if (error) return (
        <div className={styles.container}>
            <Menu />
            Error: {error}
        </div>
    );

    return (
        <div className={styles.container}>
            <Menu />

            <div className={styles.projectContainer}>
                <div className={styles.header}>
                    <button onClick={handleBack} className={styles.backButton}>
                        <FaArrowLeft /> Back to projects
                    </button>

                    <div className={styles.actions}>
                        {loading ? (
                            <>
                                <div className={`${styles.actionButton} ${styles.skeletonButton}`}></div>
                                <div className={`${styles.actionButton} ${styles.deleteButton} ${styles.skeletonButton}`}></div>
                            </>
                        ) : (
                            <>
                                <button className={styles.actionButton}>
                                    <FaEdit /> Edit
                                </button>
                                <button className={`${styles.actionButton} ${styles.deleteButton}`}>
                                    <FaTrash /> Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.projectInfo}>
                    {loading ? (
                        <ProjectTitleSkeleton />
                    ) : (
                        <h1 className={styles.projectTitle}>{project?.name}</h1>
                    )}

                    {loading ? (
                        <>
                            <ProjectDescriptionSkeleton />
                            <ProjectDescriptionSkeleton />
                        </>
                    ) : (
                        <p className={styles.projectDescription}>{project?.description}</p>
                    )}

                    {loading ? (
                        <ProjectMetaSkeleton />
                    ) : (
                        <div className={styles.projectMeta}>
                            <span>Created: {new Date(project?.created_at || '').toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                <div className={styles.sections}>
                    <section className={styles.tasksSection}>
                        <h2>Tasks</h2>
                        <div className={styles.taskList}>
                            {loading ? (
                                <TaskPlaceholderSkeleton />
                            ) : (
                                <div className={styles.taskPlaceholder}>No tasks yet</div>
                            )}
                        </div>
                    </section>

                    <section className={styles.usersSection}>
                        <h2><FaUsers /> Team Members</h2>
                        <div className={styles.userList}>
                            {loading ? (
                                <>
                                    <UserCardSkeleton />
                                    <UserCardSkeleton />
                                    <UserCardSkeleton />
                                </>
                            ) : project?.users && project.users.length > 0 ? (
                                project.users.map(user => (
                                    <div key={`user-${user.id}`} className={styles.userCard}>
                                        <div className={styles.userAvatar}>
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={styles.userName}>{user.username}</span>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noUsers}>No team members</div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Project;
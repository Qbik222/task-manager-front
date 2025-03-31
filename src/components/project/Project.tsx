import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProjectById } from '../../services/api.ts';
import styles from './Project.module.sass';
import { FaArrowLeft, FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import Menu from '../menu/Menu.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { addColumn, updateColumnsForProject } from '../../store/reducers/columnSlice.ts';

const Project = () => {
    const { projectName } = useParams<{ projectName: string }>();
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Отримуємо колонки з Redux store
    const columns = useSelector((state: RootState) =>
        state.columns.columns.filter(col => col.projectId === parseInt(projectId || '0'))
    );

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');
                if (!token) throw new Error('No authentication token found');
                if (!projectId) throw new Error('Project ID not provided');

                const projectData = await getProjectById(token, parseInt(projectId));
                setProject(projectData);

                // Якщо потрібно завантажити колонки з API, а не з localStorage:
                // dispatch(updateColumnsForProject({
                //     projectId: parseInt(projectId),
                //     columns: projectData.columns // Припускаючи, що API повертає колонки
                // }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch project');
                console.error('Error fetching project:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId, dispatch]);

    const handleBack = () => {
        navigate('/');
    };

    const startAddingColumn = () => {
        setIsAddingColumn(true);
    };

    const handleAddColumn = () => {
        if (newColumnName.trim() && projectId) {
            const newColumn = {
                id: Date.now(),
                name: newColumnName.trim(),
                projectId: parseInt(projectId)
            };
            dispatch(addColumn(newColumn));
            setNewColumnName('');
            setIsAddingColumn(false);
        }
    };

    const cancelAddingColumn = () => {
        setIsAddingColumn(false);
        setNewColumnName('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddColumn();
        } else if (e.key === 'Escape') {
            cancelAddingColumn();
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <Menu />

            <div className={styles.projectContainer}>
                <div className={styles.header}>
                    <button onClick={handleBack} className={styles.backButton}>
                        <FaArrowLeft /> Back to projects
                    </button>
                </div>

                <div className={styles.sections}>
                    <section className={styles.tasksSection}>
                        <h2>Tasks</h2>
                        <div className={styles.taskBoard}>
                            {columns.map(column => (
                                <div key={column.id} className={styles.taskColumn}>
                                    <h3>{column.name}</h3>
                                    <div className={styles.taskList}>
                                        <div className={styles.taskPlaceholder}>No tasks</div>
                                    </div>
                                </div>
                            ))}

                            <div className={styles.newTaskColumn}>
                                <div className={styles.actions}>
                                    {!isAddingColumn ? (
                                        <button
                                            className={styles.actionButton}
                                            onClick={startAddingColumn}
                                        >
                                            <FaPlus /> Add Column
                                        </button>
                                    ) : (
                                        <div
                                            className={styles.inputContainer}
                                            onBlur={(e) => {
                                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    cancelAddingColumn();
                                                }
                                            }}
                                        >
                                            <input
                                                type="text"
                                                className={styles.columnInput}
                                                placeholder="Enter column name"
                                                value={newColumnName}
                                                onChange={(e) => setNewColumnName(e.target.value)}
                                                onKeyDown={handleKeyPress}
                                                autoFocus
                                            />
                                            <div className={styles.submitWrapper}>
                                                <button
                                                    className={styles.confirmButton}
                                                    onClick={handleAddColumn}
                                                    tabIndex={0}
                                                >
                                                    add column
                                                </button>
                                                <div
                                                    onClick={cancelAddingColumn}
                                                >
                                                    <FaTimes size={30} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Project;
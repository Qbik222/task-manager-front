import ProjectHeader from './header/Header.tsx';
import ProjectBoard from './board/Board.tsx';
import { useEffect, useState } from 'react';
import { getProjectById, createColumn } from '../../services/api.ts';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateColumnsForProject, addColumn, moveTaskWithinColumn, moveTaskBetweenColumns } from '../../store/reducers/column.slice.ts';
import { projectsSocket } from "../../services/websockets/projectSocket.ts";
import styles from './project.module.sass';
import Menu from "../menu/Menu.tsx";
import {RootState} from "../../store/store.ts";

const Project = () => {
    const username = useSelector((state: RootState) => state.auth.user?.username);
    const { projectName } = useParams<{ projectName: string }>();
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('id');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const columns = useSelector((state: RootState) =>
        state.columns.filter(col => col.projectId === parseInt(projectId || '0'))
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
                if (!projectId) throw new Error('Project ID not provided');

                const projectData = await getProjectById(parseInt(projectId));
                setProject(projectData);

                if (projectData.columns) {
                    let formColumnData ={
                        projectId: parseInt(projectId),
                        columns: projectData.columns.map(col => ({
                            ...col,
                            projectId: parseInt(projectId)
                        }))
                    }

                    console.log(formColumnData)
                    dispatch(updateColumnsForProject({
                        projectId: parseInt(projectId),
                        columns: projectData.columns.map(col => ({
                            ...col,
                            projectId: parseInt(projectId)
                        }))
                    }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch project');
                console.error('Error fetching project:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId, dispatch]);

    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (source.droppableId === destination.droppableId) {
            dispatch(moveTaskWithinColumn({
                columnId: parseInt(source.droppableId),
                fromIndex: source.index,
                toIndex: destination.index
            }));
        } else {
            dispatch(moveTaskBetweenColumns({
                sourceColumnId: parseInt(source.droppableId),
                destinationColumnId: parseInt(destination.droppableId),
                taskId: parseInt(draggableId),
                newIndex: destination.index
            }));
        }
    };

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
                projectId: parseInt(projectId),
                tasks: [],
                order: columns.length
            };

            createColumn(newColumn)
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
            {username && <Menu />}
            <ProjectHeader handleBack={handleBack} projectName={project?.name} />
            <div className={styles.projectContainer}>
                <div className={styles.sections}>
                    <ProjectBoard
                        columns={columns}
                        handleDragEnd={handleDragEnd}
                        isAddingColumn={isAddingColumn}
                        setIsAddingColumn={setIsAddingColumn}
                        newColumnName={newColumnName}
                        setNewColumnName={setNewColumnName}
                        handleAddColumn={handleAddColumn}
                        cancelAddingColumn={cancelAddingColumn}
                        handleKeyPress={handleKeyPress}
                        projectId={projectId}
                    />
                </div>
            </div>
        </div>
    );
};

export default Project;

import { DragDropContext } from '@hello-pangea/dnd';
import TaskColumn from '../column/Column.tsx';
import AddColumn from '../addColumn/addColumn.tsx';
import styles from '../project.module.sass';
import {useDispatch, useSelector} from "react-redux";
import {projectsSocket} from "../../../services/websockets/projectSocket.ts";
import {useEffect} from "react";
import {updateColumnsOrder} from "../../../store/reducers/column.slice.ts";

const ProjectBoard = ({ columns, handleDragEnd, isAddingColumn, newColumnName, setNewColumnName, handleAddColumn, cancelAddingColumn, handleKeyPress, projectId }) => {
    const dispatch = useDispatch()

    const socket = projectsSocket(`/ws/projects/${projectId}/`)

    console.log(socket)



    useEffect(() => {
        socket.addEventListener("message", (e) =>{
            const data = JSON.parse(e.data)

            // console.log(data.action)

            if(data.action === "column_moved"){
                dispatch(updateColumnsOrder(data.columns))
            }
            

            console.log(data.action)

            // updateColumnsOrder(e.data)
        })
    }, [dispatch]);


    return(
    <DragDropContext onDragEnd={handleDragEnd}>
        <div className={styles.taskBoard}>
            {columns.sort((a, b) => a.order - b.order).map((column) => (
                <TaskColumn key={column.id} column={column} />
            ))}
            <div className={styles.newTaskColumn}>
                <AddColumn
                    isAddingColumn={isAddingColumn}
                    newColumnName={newColumnName}
                    setNewColumnName={setNewColumnName}
                    handleAddColumn={handleAddColumn}
                    cancelAddingColumn={cancelAddingColumn}
                    handleKeyPress={handleKeyPress}
                />
            </div>
        </div>
    </DragDropContext>
)};

export default ProjectBoard;

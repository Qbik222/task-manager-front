import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../card/Card.tsx';
import styles from '../project.module.sass';
import { useSelector, useDispatch } from 'react-redux';
import {updateColumnsOrder} from "../../../store/reducers/column.slice.ts";
import {useEffect} from "react";
import {projectsSocket} from "../../../services/websockets/projectSocket.ts";
import { moveTaskWithinColumn, moveTaskBetweenColumns } from '../../../store/reducers/column.slice.ts';






// const moveColumn = () =>{
//
// }

const Column = ({ column, index, projectId }) => {
    const columns = useSelector(state => state.columns);
    const dispatch = useDispatch()


    const handleTaskMove = (task, columns, dispatch) => {
        const destinationColumnId = task.column;

        const sourceColumn = columns.find(col =>
            col.tasks.some(t => t.id === task.id)
        );

        if (!sourceColumn) return;

        const sourceColumnId = sourceColumn.id;

        // Якщо колонка та сама – рухаємось всередині
        if (sourceColumnId === destinationColumnId) {
            const fromIndex = sourceColumn.tasks.findIndex(t => t.id === task.id);
            const toIndex = 0;

            dispatch(moveTaskWithinColumn({
                columnId: sourceColumnId,
                fromIndex,
                toIndex
            }));
        } else {
            dispatch(moveTaskBetweenColumns({
                sourceColumnId,
                destinationColumnId,
                taskId: task.id,
                newIndex: 0 // або потрібний індекс
            }));
        }
    };



    const socket = projectsSocket(`/ws/projects/${projectId}/`)

    socket.addEventListener("message", (e) =>{
        const data = JSON.parse(e.data)

        console.log(data)

        if (data.action === "task_moved") {
            handleTaskMove(data.task, columns, dispatch);
        }

    })


    return (
        <Droppable droppableId={column.id.toString()} direction="vertical" type="TASK">
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${styles.taskColumn} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                >
                    <div className={styles.columnHeader}>
                        <h3>{column.name}</h3>
                        <div className={styles.addTaskBtn}>+</div>
                    </div>
                    <div className={styles.taskList}>
                        {[...column.tasks]
                            .sort((a, b) => a.order - b.order)
                            .map((task, index) => (
                                <TaskCard key={task.id} task={task} index={index} />
                            ))}
                        {provided.placeholder}
                    </div>
                </div>
            )}
        </Droppable>
    )


};

export default Column;

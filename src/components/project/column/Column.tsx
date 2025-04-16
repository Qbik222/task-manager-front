import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../card/Card.tsx';
import styles from '../project.module.sass';
import { useSelector, useDispatch } from 'react-redux';
import {updateColumnsOrder} from "../../../store/reducers/column.slice.ts";
import {useEffect} from "react";


// const moveColumn = () =>{
//
// }

const Column = ({ column, index }) => {


    const columns = useSelector((state: RootState) => state.columns.columns);


    // const socket = projectsSocket()

    // console.log(column.id)


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
                        {column.tasks.map((task, index) => (
                            <TaskCard key={task.id} task={task} index={index}/>
                        ))}
                        {provided.placeholder}
                    </div>
                </div>
            )}
        </Droppable>
    )


};

export default Column;

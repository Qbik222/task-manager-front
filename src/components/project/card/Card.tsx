import { Draggable } from '@hello-pangea/dnd';
import styles from '../project.module.sass';

const Card = ({ task, index }) => (
    <Draggable draggableId={task.id.toString()} index={index}>
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`${styles.taskCard} ${snapshot.isDragging ? styles.dragging : ''}`}
                style={{
                    ...provided.draggableProps.style,
                }}
            >
                <h4>{task.title}</h4>
                {task.description && <p>{task.description}</p>}
            </div>
        )}
    </Draggable>
);

export default Card;

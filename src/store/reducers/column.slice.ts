import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

interface Task {
    id: number;
    title: string;
    description?: string;
    order: number;
}

interface Column {
    id: number;
    name: string;
    order: number;
    tasks: Task[];
    projectId: number;
}

type ColumnsState = Column[];

const initialState: ColumnsState = [];

// Action creators for task movement
export const moveTaskWithinColumn = createAction<{
    columnId: number;
    fromIndex: number;
    toIndex: number;
}>('columns/moveTaskWithinColumn');

export const moveTaskBetweenColumns = createAction<{
    sourceColumnId: number;
    destinationColumnId: number;
    taskId: number;
    newIndex: number;
}>('columns/moveTaskBetweenColumns');

const columnSlice = createSlice({
    name: 'columns',
    initialState,
    reducers: {
        addColumn: (state, action: PayloadAction<Omit<Column, 'tasks' | 'order'>>) => {
            const projectColumns = state.filter(col => col.projectId === action.payload.projectId);
            const newColumn: Column = {
                ...action.payload,
                tasks: [],
                order: projectColumns.length
            };
            state.push(newColumn);
        },

        updateColumnsForProject: (state, action: PayloadAction<{
            projectId: number;
            columns: Column[];
        }>) => {
            // Remove existing columns for this project
            const filteredState = state.filter(col => col.projectId !== action.payload.projectId);
            // Add new columns
            return [...filteredState, ...action.payload.columns];
        },

        updateColumnsOrder: (state, action: PayloadAction<{
            columns: {id: number, order: number}[]
        }>) => {
            action.payload.forEach(({id, order}) => {
                const column = state.find(col => col.id === id);
                if (column) {
                    column.order = order;
                }
            });
        },

        // Додаткові редюсери для більш гнучкого керування
        updateColumn: (state, action: PayloadAction<{
            id: number;
            changes: Partial<Column>;
        }>) => {
            const column = state.find(col => col.id === action.payload.id);
            if (column) {
                Object.assign(column, action.payload.changes);
            }
        },

        removeColumn: (state, action: PayloadAction<number>) => {
            return state.filter(col => col.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(moveTaskWithinColumn, (state, action) => {
                const { columnId, fromIndex, toIndex } = action.payload;
                const column = state.find(col => col.id === columnId);

                if (column && column.tasks[fromIndex]) {
                    const [movedTask] = column.tasks.splice(fromIndex, 1);
                    column.tasks.splice(toIndex, 0, movedTask);
                    column.tasks.forEach((task, idx) => {
                        task.order = idx;
                    });
                }
            })
            .addCase(moveTaskBetweenColumns, (state, action) => {
                const { sourceColumnId, destinationColumnId, taskId, newIndex } = action.payload;
                const sourceColumn = state.find(col => col.id === sourceColumnId);
                const destinationColumn = state.find(col => col.id === destinationColumnId);

                if (sourceColumn && destinationColumn) {
                    const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
                    if (taskIndex !== -1) {
                        const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
                        destinationColumn.tasks.splice(newIndex, 0, movedTask);
                        sourceColumn.tasks.forEach((task, idx) => {
                            task.order = idx;
                        });
                        destinationColumn.tasks.forEach((task, idx) => {
                            task.order = idx;
                        });
                    }
                }
            });
    }
});

export const {
    addColumn,
    updateColumnsForProject,
    updateColumnsOrder,
    updateColumn,
    removeColumn
} = columnSlice.actions;

export default columnSlice.reducer;
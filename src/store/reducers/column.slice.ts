import { createSlice, createAction, PayloadAction } from '@reduxjs/toolkit';

interface Task {
    id: number;
    title: string;
    description?: string;
}

interface Column {
    id: number;
    name: string;
    order: number;
    tasks: Task[];
    projectId: number;
}

interface ColumnsState {
    columns: Column[];
}

const initialState: ColumnsState = {
    columns: [],
};

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
            const newColumn: Column = {
                ...action.payload,
                tasks: [],
                order: state.columns.filter(col => col.projectId === action.payload.projectId).length
            };
            state.columns.push(newColumn);
        },

        updateColumnsForProject: (state, action: PayloadAction<{
            projectId: number;
            columns: Column[];
        }>) => {
            // Видаляємо старі колонки проекту
            state.columns = state.columns.filter(col => col.projectId !== action.payload.projectId);
            // Додаємо нові колонки
            state.columns.push(...action.payload.columns);
        },
        updateColumnsOrder: (state, action: PayloadAction<{
            columns: {id: number, orded: number}[]
        }>) =>{
            action.payload.forEach(({id, order}) =>{
                const column = state.columns.find(col => col.id === id)
                if (column){
                    column.order = order
                }
            })
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(moveTaskWithinColumn, (state, action) => {
                const { columnId, fromIndex, toIndex } = action.payload;
                const column = state.columns.find(col => col.id === columnId);

                if (column && column.tasks[fromIndex]) {
                    const [movedTask] = column.tasks.splice(fromIndex, 1);
                    column.tasks.splice(toIndex, 0, movedTask);
                }
            })
            .addCase(moveTaskBetweenColumns, (state, action) => {
                const { sourceColumnId, destinationColumnId, taskId, newIndex } = action.payload;

                const sourceColumn = state.columns.find(col => col.id === sourceColumnId);
                const destinationColumn = state.columns.find(col => col.id === destinationColumnId);

                if (sourceColumn && destinationColumn) {
                    const taskIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);

                    if (taskIndex !== -1) {
                        const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
                        destinationColumn.tasks.splice(newIndex, 0, movedTask);
                    }
                }
            });
    }
});

export const { addColumn, updateColumnsForProject, updateColumnsOrder } = columnSlice.actions;

export default columnSlice.reducer;
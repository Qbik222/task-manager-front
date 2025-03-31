// src/store/reducers/columnsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Column {
    id: number;
    name: string;
    projectId: number; // Додаємо projectId для прив'язки колонок до конкретного проекту
}

interface ColumnsState {
    columns: Column[];
}

const loadColumnsFromLocalStorage = (): Column[] => {
    const savedColumns = localStorage.getItem('columns');
    return savedColumns ? JSON.parse(savedColumns) : [];
};

const initialState: ColumnsState = {
    columns: loadColumnsFromLocalStorage(),
};

const columnsSlice = createSlice({
    name: 'columns',
    initialState,
    reducers: {
        addColumn: (state, action: PayloadAction<Column>) => {
            state.columns.push(action.payload);
            localStorage.setItem('columns', JSON.stringify(state.columns));
        },
        setColumns: (state, action: PayloadAction<Column[]>) => {
            state.columns = action.payload;
            localStorage.setItem('columns', JSON.stringify(state.columns));
        },
        clearColumns: (state) => {
            state.columns = [];
            localStorage.removeItem('columns');
        },
        updateColumnsForProject: (state, action: PayloadAction<{projectId: number; columns: Column[]}>) => {
            // Видаляємо старі колонки для цього проекту
            state.columns = state.columns.filter(col => col.projectId !== action.payload.projectId);
            // Додаємо нові колонки
            state.columns.push(...action.payload.columns);
            localStorage.setItem('columns', JSON.stringify(state.columns));
        },
    },
});

export const { addColumn, setColumns, clearColumns, updateColumnsForProject } = columnsSlice.actions;
export default columnsSlice.reducer;
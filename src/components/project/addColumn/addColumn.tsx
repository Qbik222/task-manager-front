import { FaPlus, FaTimes } from 'react-icons/fa';
import styles from '../project.module.sass';
const AddColumn = ({
                       isAddingColumn,
                       setIsAddingColumn,
                       newColumnName,
                       setNewColumnName,
                       handleAddColumn,
                       cancelAddingColumn,
                       handleKeyPress
                   }) => {

    return (
        <div className={styles.actions}>
            {!isAddingColumn ? (
                <button
                    className={styles.actionButton}
                    onClick={() => setIsAddingColumn(true)}
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
                        >
                            Add column
                        </button>
                        <div onClick={cancelAddingColumn}>
                            <FaTimes size={30} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddColumn;
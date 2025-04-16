import { FaArrowLeft } from 'react-icons/fa';
import styles from '../project.module.sass';

const ProjectHeader = ({ handleBack, projectName }) => (
    <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
            <FaArrowLeft /> Back to projects
        </button>
        <div>{projectName}</div>
    </div>
);

export default ProjectHeader;

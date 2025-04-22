import { useEffect, useState, useRef } from 'react';
import styles from './createProject.module.sass';
import { getAllUsers, createProject } from '../../services/api.ts';
import { FaCheck } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {useNavigate} from "react-router-dom";

type User = {
    id: number;
    username: string;
};

type NewProjectPayload = {
    name: string;
    description: string;
    users: number[];
};

export const CreateProject = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<{ id: number; username: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [formData, setFormData] = useState<NewProjectPayload[]>()

    const nameProject = useRef<HTMLInputElement>(null);
    const descProject = useRef<HTMLTextAreaElement>(null);

    const token = useSelector((state: RootState) => state.auth.tokens?.access);

    const author = useSelector((state: RootState) =>({
        id: Number(state.auth.user.userId),
        username: state.auth.user.username
    }));
    // console.log(author)

    useEffect(() => {
        if (token) {
            getAllUsers(token).then(data => {
                const fetchedUsers = data.map(user => ({ id: user.id, username: user.username }));
                setUsers(fetchedUsers);

                setSelectedUsers(prev => {
                    const alreadySelected = prev.some(u => u.id === author.id);
                    return alreadySelected ? prev : [author, ...prev];
                });
            });
        }
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setIsDropdownVisible(true);
        // console.log(users)

        const filtered = users.filter(user => {
            return user.username.toLowerCase().includes(value.toLowerCase()) ? user : null
        });


        const alreadyIncluded = filtered.some(user => user.id === author.id);
        const result = alreadyIncluded ? filtered : [author, ...filtered];

        console.log(result)

        setFilteredUsers(result);
    };

    const toggleUser = (user: User) => {
        if(user.id === author.id) return
        const alreadySelected = selectedUsers.some(u => u.id === user.id);
        if (alreadySelected) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers(prev => [...prev, { id: user.id, username: user.username }]);
        }
    };

    const handleFocus = () => {
        setIsDropdownVisible(true);
        setFilteredUsers(users);
    };

    const handleBlur = () => {
        setTimeout(() => setIsDropdownVisible(false), 100); // дати час клікнути
    };

    const handleProjectClick = (projectId: number, projectName: string) => {
        const formattedName = projectName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '');
        navigate(`/projects/${formattedName}?id=${projectId}`);
    };

    const setProject = ( e: React.FormEvent) => {
        e.preventDefault();


        // if (nameProject.current) {
        //     alert("project name is required!")
        //     return
        // };


        // console.log(selectedUsers)

        let projectData = {
            name: nameProject.current.value,
            description: descProject.current.value,
            users: selectedUsers.map(u => u.id)
        };

        console.log(projectData)

        if (token) {
          createProject(token, projectData)
              .then(res => {
              if (res && res.id && res.name) {
                  handleProjectClick(res.id, res.name);
              } else {
                  console.error('Unexpected response structure:', res);
              }
          })
              .catch(err => {
                  console.error('Project creation error:', err);
              });
        }
    };

    return (
        <div className={styles.wrapper}>
            <form className={styles.form} onSubmit={setProject}>
                <div className={styles.field}>
                    <label htmlFor="name">Project Name</label>
                    <input ref={nameProject} type="text" id="name" name="name" required minLength={1} maxLength={255} />
                </div>

                <div className={styles.field}>
                    <label htmlFor="description">Description</label>
                    <textarea ref={descProject} id="description" name="description" required minLength={1} />
                </div>

                <div className={styles.field}>
                    <label htmlFor="users">Users</label>
                    <input
                        type="text"
                        id="users"
                        name="users"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder="Start typing username..."
                        autoComplete="off"
                    />
                    {isDropdownVisible && filteredUsers.length > 0 && (
                        <ul className={styles.dropdown}>
                            {filteredUsers.map(user => (
                                <li
                                    key={user.username}
                                    onClick={() => toggleUser(user)}
                                    className={`${styles.userItem} ${selectedUsers.some(u => u.id === user.id) ? styles.selected : ''}`}
                                >
                                    {user.username}
                                    {selectedUsers.some(u => u.id === user.id) && <FaCheck className={styles.checkIcon} />}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Можна показати вибраних юзерів, якщо потрібно */}
                <div className={styles.selectedList}>
                    {selectedUsers.map(user => (
                        <span key={user.id} className={styles.selectedUser}>
                            {user.username}
                        </span>
                        ))}
                </div>

                <button type="submit" className={styles.submitBtn}>
                    Create Project
                </button>
            </form>
        </div>
    );
};

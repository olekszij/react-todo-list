// Frontend Code (React)
import { useState, useEffect } from 'react';
import axios from 'axios';
import { db } from './firebaseConfig';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrashCan, faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(faTrashCan, faEdit, faSave);

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get(`${serverUrl}/user`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
    };
    checkUser();
  }, [serverUrl]);

  useEffect(() => {
    if (user) {
      const fetchTasks = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${serverUrl}/tasks`, { withCredentials: true });
          setTasks(response.data);
        } catch (error) {
          console.error('Ошибка при получении задач:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user, serverUrl]);

  const handleLogin = () => {
    window.open(`${serverUrl}/auth/google`, '_self');
  };

  const handleLogout = () => {
    window.open(`${serverUrl}/logout`, '_self');
    setUser(null);
    setTasks([]);
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  };

  const addTask = async () => {
    if (!user) {
      alert('Please login to add a task');
      return;
    }

    if (inputValue.trim() !== '') {
      const newTask = {
        title: inputValue,
        completed: false,
        userId: user.id,
      };

      try {
        setLoading(true);
        const docRef = await addDoc(collection(db, 'tasks'), newTask);
        setTasks([...tasks, { id: docRef.id, ...newTask }]);
        setInputValue('');
      } catch (e) {
        console.error('Ошибка добавления задачи: ', e);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    if (!user) {
      alert('Please login to update a task');
      return;
    }

    try {
      setLoading(true);
      const taskDoc = doc(db, 'tasks', taskId);
      await updateDoc(taskDoc, {
        completed: !currentStatus,
      });
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      );
    } catch (e) {
      console.error('Ошибка обновления задачи: ', e);
    } finally {
      setLoading(false);
    }
  };

  const startEditingTask = (taskId, currentTitle) => {
    setEditingTaskId(taskId);
    setEditingValue(currentTitle);
  };

  const saveTask = async (taskId) => {
    if (!user) {
      alert('Please login to edit a task');
      return;
    }

    try {
      setLoading(true);
      const taskDoc = doc(db, 'tasks', taskId);
      await updateDoc(taskDoc, {
        title: editingValue,
      });
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, title: editingValue } : task
        )
      );
      setEditingTaskId(null);
      setEditingValue('');
    } catch (e) {
      console.error('Ошибка сохранения задачи: ', e);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!user) {
      alert('Please login to delete a task');
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (e) {
      console.error('Ошибка удаления задачи: ', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className='header'>
        <h1 className='title'>Todo List</h1>
        {!user ? (
          <button className='login-btn' onClick={handleLogin}>Login with Google</button>
        ) : (
          <div>
            <p>Welcome, {user.displayName}</p>
            <button className='login-btn' onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>
      <main>
        <div className='container'>
          {loading && <p>Loading...</p>}
          {tasks.length > 0 && !loading && (
            <>
              <ul>
                {tasks.map((task) => (
                  <li key={task.id} className={task.completed ? 'completed' : ''}>
                    <div className="task-left">
                      <input
                        type='checkbox'
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id, task.completed)}
                      />
                      {editingTaskId === task.id ? (
                        <input
                          type='text'
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                        />
                      ) : (
                        <span className='task-title'>{task.title}</span>
                      )}
                    </div>
                    <div className="task-right">
                      {editingTaskId === task.id ? (
                        <button className='save-btn' onClick={() => saveTask(task.id)}>
                          <FontAwesomeIcon icon='save' />
                        </button>
                      ) : (
                        <>
                          <button
                            className='edit-btn'
                            onClick={() => startEditingTask(task.id, task.title)}
                          >
                            <FontAwesomeIcon icon='edit' />
                          </button>
                          <button
                            className='delete-btn'
                            onClick={() => deleteTask(task.id)}
                          >
                            <FontAwesomeIcon icon='trash-can' />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className='input-container'>
            <input
              type='text'
              id='input'
              placeholder='New task...'
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <button onClick={addTask} className='add-btn' disabled={loading}>
              Add task
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;

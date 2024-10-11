import { useState, useEffect } from 'react';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
library.add(faTrashCan);

function App() {
  const [tasks, setTasks] = useState([]);

  const [inputValue, setInputValue] = useState('');

  // Загрузка задач из localStorage при монтировании компонента
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Сохранение задач в localStorage при изменении списка задач
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      addTask();
    }
  };

  const addTask = () => {
    if (inputValue.trim() !== '') {
      const newTask = {
        id: tasks.length + 1,
        title: inputValue,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setInputValue('');
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Функция для очистки всех задач
  const clearAllTasks = () => {
    setTasks([]);
    localStorage.removeItem('tasks'); // Удаляем задачи только при нажатии кнопки
  };

  return (
    <>
      <header>
        <h1 className='title'>Todo List</h1>
      </header>
      <main>
        <div className='container'>
          {tasks.length > 0 && (
            <>
              <ul>
                {tasks.map((task) => (
                  <li key={task.id} className={task.completed ? 'completed' : ''}>
                    <input
                      type='checkbox'
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                    />
                    <span className='task-title'>{task.title}</span>
                    <button className='delete-btn' onClick={() => deleteTask(task.id)}>
                      <FontAwesomeIcon icon='trash-can' />
                    </button>
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
            <button onClick={addTask} className='add-btn'>
              Add task
            </button>
          </div>
          {tasks.length > 0 && (
            <button className='clear-btn' onClick={clearAllTasks}>
              DELETE ALL
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export default App;

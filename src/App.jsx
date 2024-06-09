import { useState } from 'react';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
library.add(faTrashCan);

function App() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');

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

  return (
    <>
      <header>
        <h1>Todo List</h1>
      </header>
      <main>
        <div className='container'>
          {tasks.length > 0 && (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className={task.completed ? 'completed' : ''}>
                  <input
                    type='checkbox'
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                  />
                  <span>{task.title}</span>
                  <button onClick={() => deleteTask(task.id)}>
                    <FontAwesomeIcon icon='trash-can' />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className='input-container'>
            <input
              type='text'
              id='input'
              placeholder='new task'
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <button onClick={addTask}>Add task</button>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;

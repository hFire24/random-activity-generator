import React, { useState, useEffect } from "react";
import TaskItem from "./TaskItem";
import TaskEditor from "./TaskEditor";

const ManagePage = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [existingTask, setExistingTask] = useState(true);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("activities")) || [
      {
        text: "Add your first activity to get started!",
        link: "manage.html",
        category: null,
        importance: 1,
        standingTask: false,
        activeTask: false,
        longTask: false,
        mobileFriendlyTask: false,
        timesCompleted: 0,
        timesSkipped: 0,
        dateCreated: new Date().toISOString(),
        archived: false,
      },
    ];
    setTasks(storedTasks);
  }, []);

  function editTask(task, existing) {
    setEditingTask(task);
    setExistingTask(existing);
  }

  const saveTask = (newTask) => {
    setTasks((prevTasks) => {
      const updatedTasks = existingTask
        ? prevTasks.map((task) => (task === editingTask ? newTask : task))
        : [...prevTasks, newTask];
  
      localStorage.setItem("activities", JSON.stringify(updatedTasks)); // Save the UPDATED tasks
      return updatedTasks;
    });
  
    setEditingTask(null); // Close the editor after saving
    setExistingTask(false);
  };

  return (
    <div>
      <h1>Manage Activities</h1>

      <div id="activitiesContainer">
        {tasks.map((task, index) => (
          <TaskItem key={index} task={task} onEdit={() => editTask(task, true)}/>
        ))}
      </div>
      <div id="buttonsReactContainer">
        <button onClick={() => editTask({}, false)} className="green">Add Activity</button>
        <button onClick={() => alert("Tutorial Button pressed!")} className="purple">Tutorial</button>
        <button onClick={() => location.href='index.html'} className="blue">Back to Main Page</button>
        <button onClick={() => alert("Export Button pressed!")} className="gray">Export Activities</button>
        <button onClick={() => alert("Import Button pressed!")} className="gray">Import Activities</button>
      </div>
      {editingTask !== null && <TaskEditor task={editingTask} onSave={saveTask} onClose={() => setEditingTask(null)}/>}
    </div>
  );
};

export default ManagePage;
import React, { useState, useEffect } from "react";
import TaskItem from "./TaskItem";
import TaskEditor from "./TaskEditor";
import CategoryManager from "./CategoryManager";
import { useNavigate } from "react-router-dom";
import { getActivities, saveActivities, getCategories, saveCategories, getWipes, saveWipes, getSecrets, saveSecrets, initSync } from "../../sync.js";
import { getCurrentUser, onAuthChange, logout } from "../../auth.js";

const ManagePage = () => {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [existingTask, setExistingTask] = useState(true);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication and initialize sync
    const offlineMode = localStorage.getItem('offlineMode');
    
    if (offlineMode === 'true') {
      // Offline mode
      setIsAuthenticated(true);
      setIsLoading(false);
      setTasks(getActivities());
    } else {
      // Check for authenticated user
      const unsubscribe = onAuthChange(async (user) => {
        if (user) {
          await initSync();
          setIsAuthenticated(true);
          setTasks(getActivities());
        } else {
          // Redirect to login
          window.location.href = '/login.html';
        }
        setIsLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, []);

  function editTask(task, existing) {
    setEditingTask(task);
    setExistingTask(existing);
  }

  const saveTask = async (newTask) => {
    const updatedTasks = existingTask
      ? tasks.map((task) => (task === editingTask ? newTask : task))
      : [...tasks, newTask];
    
    await saveActivities(updatedTasks);
    setTasks(updatedTasks);
    setEditingTask(null);
    setExistingTask(false);
  };
  
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    
    if (dragIndex === dropIndex) return;
    
    const updatedTasks = [...tasks];
    const [draggedTask] = updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(dropIndex, 0, draggedTask);
    
    await saveActivities(updatedTasks);
    setTasks(updatedTasks);
  };
  
  const handleDelete = async (taskToDelete) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const updatedTasks = tasks.filter(task => task !== taskToDelete);
      await saveActivities(updatedTasks);
      setTasks(updatedTasks);
    }
  };
  
  const handleArchive = async (taskToArchive) => {
    if (window.confirm("Are you sure you want to archive this task?")) {
      const updatedTasks = tasks.map(task => 
        task === taskToArchive ? { ...task, archived: true } : task
      );
      await saveActivities(updatedTasks);
      setTasks(updatedTasks);
    }
  };
  
  const handleUnarchive = async (taskToUnarchive) => {
    const updatedTasks = tasks.map(task => 
      task === taskToUnarchive ? { ...task, archived: false } : task
    );
    await saveActivities(updatedTasks);
    setTasks(updatedTasks);
  };
  
  const handleDuplicate = async (taskToDuplicate) => {
    const duplicated = {
      ...taskToDuplicate,
      text: taskToDuplicate.text + " copy",
      timesCompleted: 0,
      timesSkipped: 0,
      dateCreated: new Date().toISOString()
    };
    const taskIndex = tasks.indexOf(taskToDuplicate);
    const updatedTasks = [...tasks];
    updatedTasks.splice(taskIndex + 1, 0, duplicated);
    await saveActivities(updatedTasks);
    setTasks(updatedTasks);
    // Open editor for the duplicated task
    setEditingTask(duplicated);
    setExistingTask(true);
  };
  
  const handleExport = () => {
    const exportData = {
      activities: tasks,
      categories: getCategories(),
      wipes: getWipes(),
      secrets: getSecrets()
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activities.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        // Support both old format (array) and new format (object)
        if (Array.isArray(imported)) {
          // Old format - just activities
          await saveActivities(imported);
          setTasks(imported);
          alert("Activities imported successfully!");
        } else if (imported.activities) {
          // New format - activities, categories, wipes, and secrets
          await saveActivities(imported.activities);
          setTasks(imported.activities);
          
          if (imported.categories) {
            await saveCategories(imported.categories);
          }
          
          if (imported.wipes) {
            await saveWipes(imported.wipes);
          }
          
          if (imported.secrets) {
            await saveSecrets(imported.secrets);
          }
          
          alert("Activities, categories, secrets, and settings imported successfully!");
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        alert("Error reading file: " + error.message);
      }
    };
    reader.readAsText(file);
  };
  
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login.html';
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'WARNING: This will permanently delete your account and ALL data.\n\n' +
      'This action CANNOT be undone.\n\n' +
      'Type "DELETE" to confirm:'
    );
    
    if (confirmation === 'DELETE') {
      const { deleteAccount } = await import('../../auth.js');
      const result = await deleteAccount();
      
      if (result.success) {
        alert('Your account has been permanently deleted.');
        window.location.href = '/login.html';
      } else {
        if (result.requiresReauth) {
          alert(result.error);
          await handleLogout();
        } else {
          alert('Failed to delete account: ' + result.error);
        }
      }
    } else if (confirmation !== null) {
      alert('Account deletion cancelled. You must type "DELETE" exactly to confirm.');
    }
  };

  if (isLoading) {
    return <div><h1>Loading...</h1></div>;
  }

  return (
    <div>
      {isAuthenticated && localStorage.getItem('offlineMode') !== 'true' && (
        <button 
          onClick={handleLogout} 
          className="red"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}
        >
          Logout
        </button>
      )}
      <h1>Manage Activities</h1>

      <div id="activitiesContainer">
        {tasks.map((task, index) => (
          <TaskItem 
            key={index} 
            task={task} 
            index={index}
            onEdit={() => editTask(task, true)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
      <div id="buttonsReactContainer">
        <div className="button-section">
          <h3>Activity Management</h3>
          <button onClick={() => editTask({}, false)} className="green">Add Activity</button>
          <button onClick={() => setShowCategoryManager(true)} className="orange">Manage Categories</button>
          <button onClick={() => navigate("/secrets")} className="red2">Manage Secrets</button>
        </div>

        <div className="button-section">
          <h3>Data</h3>
          <button onClick={handleExport} className="gray">Export Data</button>
          <button onClick={() => document.getElementById('import-file').click()} className="gray">Import Data</button>
        </div>

        <div className="button-section">
          <h3>Help</h3>
          <button onClick={() => setShowTutorial(true)} className="purple">Tutorial</button>
        </div>

        {isAuthenticated && localStorage.getItem('offlineMode') !== 'true' && (
          <div className="button-section">
            <h3>Account</h3>
            <button onClick={handleDeleteAccount} className="red">Delete Account</button>
          </div>
        )}

        <input
          id="import-file"
          type="file"
          accept="application/json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
      {editingTask !== null && (
        <TaskEditor 
          task={editingTask} 
          onSave={saveTask} 
          onClose={() => setEditingTask(null)}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onUnarchive={handleUnarchive}
          onDuplicate={handleDuplicate}
        />
      )}
      {showCategoryManager && (
        <CategoryManager onClose={() => setShowCategoryManager(false)} />
      )}
      {showTutorial && (
        <div id="popupOverlay" className="popup-overlay-react">
          <div id="popupWindow" className="popup-window-react">
            <h2>How to Add a Task</h2>
            <p>1. Click on the "Add Activity" button.</p>
            <p>2. Enter the task details in the popup window.</p>
            <p>3. Adjust the importance slider and toggle options for standing, active, long, and mobile-friendly tasks.</p>
            <p>4. Click "Save" to add the task to your list.</p>
            <h3>Other Features</h3>
            <p><strong>Manage Categories:</strong> Create custom categories and set which ones should wipe all tasks in the category when one is completed.</p>
            <p><strong>Export/Import:</strong> Save your activities, categories, and settings to a JSON file or load them from a backup.</p>
            <p><strong>Drag and Drop:</strong> Reorder tasks by dragging them using the ☰ handle.</p>
            <p><strong>Archive:</strong> Hide tasks from the activity page without deleting them. Unarchive them later if needed.</p>
            <button onClick={() => setShowTutorial(false)} className="red">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePage;
import React, { useState, useEffect, use } from "react";
import Task from "./Task";
import { useNavigate } from "react-router-dom";
import { getActivities, saveActivities, getWipes, getCurrentTask, saveCurrentTask } from "../../sync.js";
import { sanitizeInput } from "./utils.js";

const Activity = (props) => {
  const [activities, setActivities] = useState([]);
  const [activity, setActivity] = useState({
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
      });
  const [completedActivities, setCompletedActivities] = useState([]);
  const [skippedActivities, setSkippedActivities] = useState([]);
  const [customActivity, setCustomActivity] = useState(null);
  const [standingTaskPending, setStandingTaskPending] = useState(false);
  const [actualTask, setActualTask] = useState(null);
  const [hasValidSavedTask, setHasValidSavedTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const bedtimeEnabled = true;
  const sleep = 22; // 10 PM
  const wake = 6;   // 6 AM
  
  const isBedtime = (sleepHour, wakeHour) => {
    const d = new Date();
    const hour = d.getHours();
    return (sleepHour > wakeHour) 
      ? (hour < wakeHour || hour >= sleepHour) 
      : (hour >= sleepHour && hour < wakeHour);
  };
  
  const getTodayAtWakeTime = () => {
    let now = new Date();
    let wakeTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), wake - 1, 0, 0, 0);
    if (wakeTime.getTime() < now.getTime()) {
      wakeTime.setDate(wakeTime.getDate() + 1);
    }
    return wakeTime;
  };
  
  const resetCompletedActivities = async () => {
    setCompletedActivities([]);
    localStorage.setItem('completedActivities', JSON.stringify([]));
    localStorage.setItem('nextResetTime', getTodayAtWakeTime().toISOString());
    await saveCurrentTask(null); // Clear current task on daily reset
    console.log("Completed activities reset for the new day.");
  };

  useEffect(() => {
    // Check if completed activities need to be reset
    let nextResetTime = new Date(localStorage.getItem('nextResetTime'));
    if (!nextResetTime || isNaN(nextResetTime.getTime())) {
      nextResetTime = getTodayAtWakeTime();
      localStorage.setItem('nextResetTime', nextResetTime.toISOString());
    }
    
    let now = new Date();
    if (now > nextResetTime) {
      resetCompletedActivities();
    }
    
    // Load completed activities from localStorage
    const completed = JSON.parse(localStorage.getItem('completedActivities')) || [];
    setCompletedActivities(completed);
    
    let storedTasks = getActivities()
      .filter((activity) => !activity.archived)
      .map(activity => ({
        ...activity,
        timesCompleted: activity.timesCompleted ?? 0,
        timesSkipped: activity.timesSkipped ?? 0,
        timesSkippedConsecutively: activity.timesSkippedConsecutively ?? 0
      }));
    
    // Add bedtime task if it's bedtime
    if (isBedtime(sleep, wake - 1) && bedtimeEnabled) {
      storedTasks.push({
        text: "Wear your pajamas and go to bed.",
        link: null,
        category: "sleep",
        importance: 3,
        standingTask: true,
        activeTask: false,
        longTask: false,
        mobileFriendlyTask: true,
        timesCompleted: 0,
        timesSkipped: 0,
        dateCreated: new Date().toISOString(),
        archived: false
      });
    }
    
    console.log(props.filter);
    
    let filtered = storedTasks;
    switch (props.filter) {
      case 'short':
        filtered = storedTasks.filter(activity => !activity.longTask);
        break;
      case 'lazy':
        filtered = storedTasks.filter(activity => !activity.activeTask);
        break;
      case 'lowPriority':
        filtered = storedTasks.filter(activity => activity.importance <= 2);
        break;
      case 'highPriority':
        filtered = storedTasks.filter(activity => activity.importance > 1);
        break;
      case 'mobile':
        filtered = storedTasks.filter(activity => activity.mobileFriendlyTask);
        break;
      default:
        filtered = storedTasks;
    }
    
    // Check if there's a saved current task and if it's from today
    const savedTask = getCurrentTask();
    let hasValidTask = false;
    
    if (savedTask && savedTask.savedAt) {
      const savedDate = new Date(savedTask.savedAt);
      const today = new Date();
      
      // Check if the saved task is from today (same year, month, and day)
      const isSameDay = savedDate.getFullYear() === today.getFullYear() &&
                        savedDate.getMonth() === today.getMonth() &&
                        savedDate.getDate() === today.getDate();
      
      // Don't use the "No activities available" message as a valid saved task
      const isNoActivitiesMessage = savedTask.text === "No activities available. Press 'Manage Activities' to add tasks!";
      const isStretchMessage = savedTask.text === "Stand up and stretch if you can.";

      if (isSameDay && !isNoActivitiesMessage) {
        // If it's the stretch message, only restore if actualTask exists
        if (isStretchMessage) {
          if (savedTask.actualTask) {
            setActivity(savedTask);
            setStandingTaskPending(true);
            setActualTask(savedTask.actualTask);
            hasValidTask = true;
          } else {
            // Corrupt state: stretch message but no actualTask, so clear and force new task
            saveCurrentTask(null);
          }
        } else {
          // Check if the saved task is a standing task that was completed
          // If so, we need to go through the standing flow again
          if (savedTask.standingTask) {
            // Check if this task was already completed
            if (completed.includes(savedTask.text)) {
              // Don't restore - let it generate a new task or show the standing prompt
              saveCurrentTask(null);
            } else {
              // Task not completed yet, show the standing prompt
              setActualTask(savedTask);
              setActivity({
                text: "Stand up and stretch if you can.",
                link: null,
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
              });
              setStandingTaskPending(true);
              saveCurrentTask({
                text: "Stand up and stretch if you can.",
                link: null,
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
                actualTask: savedTask
              });
              hasValidTask = true;
            }
          } else {
            // Not a standing task, restore normally
            setActivity(savedTask);
            hasValidTask = true;
          }
        }
      } else {
        // Clear the old task since it's from a previous day or is the "no activities" message
        saveCurrentTask(null);
      }
    }
    
    setHasValidSavedTask(hasValidTask);
    setActivities(filtered);
    setIsLoading(false);
  }, [props.filter]);

  useEffect(() => {
    console.log('Second useEffect running. Activities:', activities.length, 'Loading:', isLoading, 'HasValid:', hasValidSavedTask);
    
    // Don't run until activities are loaded
    if (isLoading) {
      console.log('Still loading, skipping');
      return;
    }
    
    // Don't generate a new task if we have a valid saved task from today
    if (hasValidSavedTask) {
      console.log('Has valid saved task, skipping generation');
      return;
    }
    
    // Filter out completed and skipped activities
    const availableActivities = activities.filter(
      act => !completedActivities.includes(act.text) && !skippedActivities.includes(act.text)
    );
    console.log('Available activities after filtering:', availableActivities.length);
    
    if (customActivity) {
      // Show custom activity
      const customTask = {
        text: customActivity,
        link: null,
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
      };
      setActivity(customTask);
      saveCurrentTask(customTask);
    } else if (availableActivities.length > 0) {
      let selectedActivity;
      
      // 1 in 4 chance of showing sleep task at bedtime
      if (isBedtime(sleep, wake - 1) && 
          !Math.floor(Math.random() * 4) && 
          availableActivities[availableActivities.length - 1]?.category === "sleep") {
        selectedActivity = availableActivities[availableActivities.length - 1];
      } else {
        const randomIndex = Math.floor(Math.random() * availableActivities.length);
        selectedActivity = availableActivities[randomIndex];
      }
      
      // Check if it's a standing task
      if (selectedActivity.standingTask && !standingTaskPending) {
        setActualTask(selectedActivity);
        setActivity({
          text: "Stand up and stretch if you can.",
          link: null,
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
        });
        setStandingTaskPending(true);
        saveCurrentTask({
          text: "Stand up and stretch if you can.",
          link: null,
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
          actualTask: selectedActivity // Save the actual task to restore later
        });
      } else {
        setActivity(selectedActivity);
        setStandingTaskPending(false);
        saveCurrentTask(selectedActivity);
      }
    } else if (skippedActivities.length > 0) {
      // Reset skipped activities and try again
      setSkippedActivities([]);
      const randomIndex = Math.floor(Math.random() * activities.length);
      const newActivity = activities[randomIndex];
      setActivity(newActivity);
      saveCurrentTask(newActivity);
    } else {
      const noActivityTask = {
        text: "No activities available. Press 'Manage Activities' to add tasks!",
        link: null,
        category: null,
        importance: 1,
        standingTask: false,
        activeTask: false,
        longTask: false,
        mobileFriendlyTask: false,
        timesCompleted: 0,
        timesSkipped: 0,
        dateCreated: new Date().toISOString(),
        archived: false
      };
      setActivity(noActivityTask);
      saveCurrentTask(noActivityTask);
    }
  }, [activities, completedActivities, skippedActivities, customActivity, isLoading, hasValidSavedTask]);

  const saveActivity = async (updatedActivity) => {
    const allActivities = getActivities();
    const activityIndex = allActivities.findIndex(
      (act) => act.text === updatedActivity.text
    );

    if (activityIndex !== -1) {
      allActivities[activityIndex] = updatedActivity;
      await saveActivities(allActivities);
    }
  };

  const handleWipedCategory = (category, completed) => {
    const wipedCategories = getWipes();
    if (!wipedCategories.includes(category)) return;
    
    const allActivities = getActivities();
    allActivities.forEach(act => {
      if (act.category === category) {
        if (completed) {
          if (!completedActivities.includes(act.text)) {
            setCompletedActivities(prev => [...prev, act.text]);
          }
        } else {
          if (!skippedActivities.includes(act.text)) {
            setSkippedActivities(prev => [...prev, act.text]);
          }
        }
      }
    });
  };

  const filtered = (customText) => {
    if (!customText || customText.length === 0) return true;
    
    const newBreakLC = customText.toLowerCase();
    const secretArray = JSON.parse(localStorage.getItem('secretArray')) || [];
    
    if (secretArray.some(item => newBreakLC.includes(item)) || newBreakLC.endsWith(" rem")) {
      alert("That should not be a priority.");
      return true;
    }
    
    const boringWords = ['bored', 'bore', 'lazy', 'nothing', "don't feel like doing", 'uhh', 'umm', 'hmm',
      'lack of interest', "don't know", 'don\'t know', 'dunno', 'no idea', 'no reason', 'idk'];
    
    return boringWords.some(word => newBreakLC.includes(word));
  };

  async function markAsCompleted() {
    if (!activity) return;

    const taskToUpdate = standingTaskPending ? actualTask : activity;

    if (!customActivity && !completedActivities.includes(taskToUpdate.text) && taskToUpdate.category !== "sleep") {
      taskToUpdate.timesCompleted = (taskToUpdate.timesCompleted ?? 0) + 1;
      taskToUpdate.timesSkippedConsecutively = 0;

      // Add to completed activities
      const newCompleted = [...completedActivities, taskToUpdate.text];
      setCompletedActivities(newCompleted);
      localStorage.setItem('completedActivities', JSON.stringify(newCompleted));

      // Save the activity back
      await saveActivity(taskToUpdate);

      // Handle wiped category
      handleWipedCategory(taskToUpdate.category, true);
    }

    // Clear custom activity and standing task state
    setCustomActivity(null);
    setStandingTaskPending(false);
    setActualTask(null);
    setHasValidSavedTask(false); // Force generation of new task
  }

  async function skipTask() {
    if (!activity) return;

    const taskToUpdate = standingTaskPending ? actualTask : activity;

    if (!customActivity && !skippedActivities.includes(taskToUpdate.text) && taskToUpdate.category !== "sleep") {
      taskToUpdate.timesSkipped = (taskToUpdate.timesSkipped ?? 0) + 1;
      taskToUpdate.timesSkippedConsecutively = (taskToUpdate.timesSkippedConsecutively ?? 0) + 1;

      // Add to skipped activities
      setSkippedActivities(prev => [...prev, taskToUpdate.text]);

      // Save the activity back
      await saveActivity(taskToUpdate);

      // Handle wiped category
      handleWipedCategory(taskToUpdate.category, false);
    }

    // Clear custom activity and standing task state
    setCustomActivity(null);
    setStandingTaskPending(false);
    setActualTask(null);
    setHasValidSavedTask(false); // Force generation of new task
  }

  async function addCustomTask() {
    const customText = window.prompt("Type in the task you need to do:");
    if (customText && customText.trim() && !filtered(customText)) {
      const sanitizedText = sanitizeInput(customText);
      const customTask = {
        text: sanitizedText,
        link: null,
        category: "Custom",
        importance: 2,
        standingTask: false,
        activeTask: false,
        longTask: false,
        mobileFriendlyTask: true,
        timesCompleted: 0,
        timesSkipped: 0,
        timesSkippedConsecutively: 0,
        dateCreated: new Date().toISOString(),
        archived: false,
      };
      
      // Set it as the current activity immediately
      setActivity(customTask);
      setHasValidSavedTask(true); // Mark that we have a valid current task
      await saveCurrentTask(customTask);
      setCustomActivity(sanitizedText);
    }
  }
  
  const handleStandClick = () => {
    let taskToShow = actualTask;
    
    // If actualTask state is null, try to get it from the saved task
    if (!taskToShow) {
      const savedTask = getCurrentTask();
      if (savedTask && savedTask.actualTask) {
        taskToShow = savedTask.actualTask;
        setActualTask(taskToShow);
      }
    }
    
    if (taskToShow) {
      setActivity(taskToShow);
      setStandingTaskPending(false);
      saveCurrentTask(taskToShow);
    }
  };

  if (isLoading) {
    return <div><h1>Loading...</h1></div>;
  }

  const isStretchMessage = activity.text === "Stand up and stretch if you can.";

  return (
    <>
      <Task 
        link={(!isStretchMessage && activity.link) ? activity.link : null}
        onClick={isStretchMessage ? handleStandClick : undefined}
        forceUnderline={isStretchMessage}
      >
        {activity.text}
      </Task>
      {!isStretchMessage && (
        <>
          <button onClick={() => markAsCompleted()} className="activity-button green">Mark as Completed</button>
          <button onClick={() => skipTask()} className="skip-button red">Skip Task</button>
        </>
      )}
      <br/>
      <button onClick={addCustomTask} className="purple">Add Custom Task</button>
      <button onClick={() => navigate("/manage")} className="blue">Manage Activities</button>
      <br/><br/>
    </>
  )
};

export default Activity;
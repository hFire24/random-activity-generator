import React, { useState, useEffect, useRef } from "react";
import Task from "./Task";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, onAuthChange } from "../../auth.js";
import {
  getActivities,
  saveActivities,
  getWipes,
  getCurrentTask,
  saveCurrentTask,
  initSync,
  getCompletedActivities,
  saveCompletedActivities,
  getSkippedActivities,
  saveSkippedActivities,
  getNextResetTime,
  saveNextResetTime,
  getSecrets,
  isOfflineModeEnabled
} from "../../sync.js";
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
  const [customTaskInput, setCustomTaskInput] = useState("");
  const [pendingCustomTask, setPendingCustomTask] = useState(null);
  const [standingTaskPending, setStandingTaskPending] = useState(false);
  const [actualTask, setActualTask] = useState(null);
  const [hasValidSavedTask, setHasValidSavedTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [syncTick, setSyncTick] = useState(0);
  const previousFilterRef = useRef(props.filter);
  const skipNextGenerationRef = useRef(false);
  const navigate = useNavigate();

  const unwrapActualTask = (task) => {
    let current = task;
    while (current && current.actualTask) {
      current = current.actualTask;
    }
    return current;
  };
  
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
    await saveCompletedActivities([]);
    setSkippedActivities([]);
    await saveSkippedActivities([]);
    await saveNextResetTime(getTodayAtWakeTime().toISOString());
    await saveCurrentTask(null); // Clear current task on daily reset
    console.log("Completed activities reset for the new day.");
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isOfflineModeEnabled()) {
        if (!getCurrentUser()) {
          return;
        }
        await initSync();
      }
      if (!isMounted) return;
      const filterChanged = previousFilterRef.current !== props.filter;
      if (filterChanged) {
        skipNextGenerationRef.current = true;
        previousFilterRef.current = props.filter;
      }
      // Check if completed activities need to be reset
      const nextResetTimeValue = getNextResetTime();
      let nextResetTime = new Date(nextResetTimeValue);
      if (!nextResetTime || isNaN(nextResetTime.getTime())) {
        nextResetTime = getTodayAtWakeTime();
        await saveNextResetTime(nextResetTime.toISOString());
      }
      
      let now = new Date();
      if (now > nextResetTime) {
        await resetCompletedActivities();
      }
      
      // Load completed/skipped activities from sync
      const completed = getCompletedActivities() || [];
      const skipped = getSkippedActivities() || [];
      setCompletedActivities(completed);
      setSkippedActivities(skipped);
      
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
      
      const activeFilter = props.filter || "default";
      console.log(activeFilter);
      
      let filtered = storedTasks;
      switch (activeFilter) {
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
      let savedTask = await getCurrentTask();
      let hasValidTask = false;

      // Migration: if old data stored the stretch mask with actualTask, restore the real task
      if (savedTask && savedTask.text === "Stand up and stretch if you can." && savedTask.actualTask) {
        savedTask = unwrapActualTask(savedTask.actualTask);
        await saveCurrentTask(savedTask);
      }
      
      if (savedTask && savedTask.savedAt) {
        const savedDate = new Date(savedTask.savedAt);
        const now = new Date();
        const nowTime = now.getTime();
        const savedTime = savedDate.getTime();
        const twentyFourHoursMs = 24 * 60 * 60 * 1000;
        
        // Treat as valid if saved within the last 24 hours (timezone-safe)
        const isSameDay = nowTime - savedTime <= twentyFourHoursMs;
        
        // Don't use the "No activities available" message as a valid saved task
        const isNoActivitiesMessage = savedTask.text === "No activities available. Press 'Manage Activities' to add tasks!";
        if (isSameDay && !isNoActivitiesMessage) {
          // Check if the saved task is a standing task that was completed
          // If so, we need to go through the standing flow again
          if (savedTask.standingTask) {
            // Check if this task was already completed
            if (completed.includes(savedTask.text)) {
              // Don't restore - let it generate a new task or show the standing prompt
              saveCurrentTask(null);
            } else {
              // Task not completed yet, show the standing prompt mask
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
              hasValidTask = true;
            }
          } else {
            // Not a standing task, restore normally
            setActivity(savedTask);
            hasValidTask = true;
          }
        } else {
          // Clear the old task since it's from a previous day or is the "no activities" message
          saveCurrentTask(null);
        }
      } else if (savedTask) {
        // Missing savedAt or corrupt state: clear so a new task is generated
        saveCurrentTask(null);
      }
      
      setHasValidSavedTask(hasValidTask);
      setActivities(filtered);
      setIsLoading(false);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [props.filter, syncTick]);

  useEffect(() => {
    if (isOfflineModeEnabled()) return;

    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        await initSync();
        setSyncTick((tick) => tick + 1);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleCloudSyncUpdated = () => {
      setSyncTick((tick) => tick + 1);
    };

    window.addEventListener('cloudSyncUpdated', handleCloudSyncUpdated);
    return () => {
      window.removeEventListener('cloudSyncUpdated', handleCloudSyncUpdated);
    };
  }, []);

  useEffect(() => {
    console.log('Second useEffect running. Activities:', activities.length, 'Loading:', isLoading, 'HasValid:', hasValidSavedTask);
    
    // Don't run until activities are loaded
    if (isLoading) {
      console.log('Still loading, skipping');
      return;
    }

    if (skipNextGenerationRef.current) {
      skipNextGenerationRef.current = false;
      return;
    }
    
    // Don't generate a new task if we have a valid saved task from today
    if (hasValidSavedTask) {
      console.log('Has valid saved task, skipping generation');
      return;
    }
    
    const generateTask = async () => {
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
        await saveCurrentTask(customTask);
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
          await saveCurrentTask(selectedActivity);
        } else {
          setActivity(selectedActivity);
          setStandingTaskPending(false);
          await saveCurrentTask(selectedActivity);
        }
      } else if (skippedActivities.length > 0) {
        // Reset skipped activities and try again
        setSkippedActivities([]);
        const randomIndex = Math.floor(Math.random() * activities.length);
        const newActivity = activities[randomIndex];
        setActivity(newActivity);
        await saveCurrentTask(newActivity);
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
        await saveCurrentTask(noActivityTask);
      }
    };

    void generateTask();
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
    const categoryTaskTexts = allActivities
      .filter((act) => act.category === category)
      .map((act) => act.text);

    if (completed) {
      setCompletedActivities((prev) => {
        const next = Array.from(new Set([...prev, ...categoryTaskTexts]));
        void saveCompletedActivities(next);
        return next;
      });
      return;
    }

    setSkippedActivities((prev) => {
      const next = Array.from(new Set([...prev, ...categoryTaskTexts]));
      void saveSkippedActivities(next);
      return next;
    });
  };

  const filtered = (customText) => {
    if (!customText || customText.length === 0) return true;
    
    const newBreakLC = customText.toLowerCase();
    const secretArray = getSecrets() || [];
    
    if (secretArray.some(item => newBreakLC.includes(item)) || newBreakLC.endsWith(" rem")) {
      alert("That should not be a priority.");
      return true;
    }
    
    const boringWords = ['bored', 'bore', 'lazy', 'nothing', "don't feel like doing", 'uhh', 'umm', 'hmm',
      'lack of interest', "don't know", 'don\'t know', 'dunno', 'no idea', 'no reason', 'idk'];
    
    if (boringWords.some(word => newBreakLC.includes(word))) {
      alert("That doesn't seem like a valid activity.");
      return true;
    }
    return false;
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
      await saveCompletedActivities(newCompleted);

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
      const nextSkipped = [...skippedActivities, taskToUpdate.text];
      setSkippedActivities(nextSkipped);
      await saveSkippedActivities(nextSkipped);

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

  const updatePreviousTask = async (action) => {
    if (!activity) return;

    const taskToUpdate = standingTaskPending ? actualTask : activity;
    if (!taskToUpdate) return;

    if (!customActivity && taskToUpdate.category !== "sleep") {
      if (action === "completed" && !completedActivities.includes(taskToUpdate.text)) {
        taskToUpdate.timesCompleted = (taskToUpdate.timesCompleted ?? 0) + 1;
        taskToUpdate.timesSkippedConsecutively = 0;

        const newCompleted = [...completedActivities, taskToUpdate.text];
        setCompletedActivities(newCompleted);
        await saveCompletedActivities(newCompleted);

        await saveActivity(taskToUpdate);
        handleWipedCategory(taskToUpdate.category, true);
      }

      if (action === "skipped" && !skippedActivities.includes(taskToUpdate.text)) {
        taskToUpdate.timesSkipped = (taskToUpdate.timesSkipped ?? 0) + 1;
        taskToUpdate.timesSkippedConsecutively = (taskToUpdate.timesSkippedConsecutively ?? 0) + 1;

        const nextSkipped = [...skippedActivities, taskToUpdate.text];
        setSkippedActivities(nextSkipped);
        await saveSkippedActivities(nextSkipped);

        await saveActivity(taskToUpdate);
        handleWipedCategory(taskToUpdate.category, false);
      }
    }
  };

  async function submitCustomTask(event) {
    event.preventDefault();
    const customText = customTaskInput;
    if (!customText || !customText.trim()) return;

    if (filtered(customText)) {
      setCustomTaskInput("");
      setPendingCustomTask(null);
      return;
    }

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

    setPendingCustomTask(customTask);
  }

  const handleCustomTaskDecision = async (decision) => {
    if (!pendingCustomTask) return;

    if (decision === "cancel") {
      setCustomTaskInput(pendingCustomTask.text);
      setPendingCustomTask(null);
      return;
    }

    await updatePreviousTask(decision === "completed" ? "completed" : "skipped");

    setActivity(pendingCustomTask);
    setHasValidSavedTask(true);
    await saveCurrentTask(pendingCustomTask);
    setCustomActivity(pendingCustomTask.text);
    setCustomTaskInput("");
    setStandingTaskPending(false);
    setActualTask(null);
    setPendingCustomTask(null);
  };
  
  const handleStandClick = async () => {
    let taskToShow = actualTask;
    
    // If actualTask state is null, try to get it from the saved task
    if (!taskToShow) {
      const savedTask = await getCurrentTask();
      if (savedTask && savedTask.standingTask) {
        taskToShow = savedTask;
        setActualTask(savedTask);
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
  const activeFilter = props.filter || "default";

  const handleFilterChange = (event) => {
    const nextFilter = event.target.value;
    if (props.onFilterChange) {
      props.onFilterChange(nextFilter);
    }
  };

  return (
    <>
      <Task 
        link={(!isStretchMessage && activity.link) ? activity.link : null}
        onClick={isStretchMessage ? handleStandClick : undefined}
        forceUnderline={isStretchMessage}
      >
        {activity.text}
      </Task>
      {(!isStretchMessage && !pendingCustomTask) && (
        <>
          <button onClick={() => markAsCompleted()} className="activity-button green">Mark as Completed</button>
          <button onClick={() => skipTask()} className="skip-button red">Skip Task</button>
        </>
      )}
      {!pendingCustomTask && <form className="custom-task-form" onSubmit={submitCustomTask}>
        <input
          id="customTaskInput"
          type="text"
          placeholder="Type a custom task"
          value={customTaskInput}
          onChange={(event) => setCustomTaskInput(event.target.value)}
        />
        <button type="submit" className="purple">Add Custom Task</button>
      </form>}
      {pendingCustomTask && (
        <div className="custom-task-decision">
          <h3>New task: {pendingCustomTask.text}</h3>
          <p>Complete <strong>{activity.text}</strong> or skip?</p>
          <button onClick={() => handleCustomTaskDecision("completed")} className="activity-button green">Mark as Completed</button>
          <button onClick={() => handleCustomTaskDecision("skipped")} className="skip-button red">Skip Task</button>
          <button onClick={() => handleCustomTaskDecision("cancel")} className="blue">Cancel</button>
        </div>
      )}
      <button onClick={() => navigate("/manage")} className="blue">Manage Activities</button>
      <div className="filter-select">
        <label htmlFor="filterSelect"><h3>Filter</h3></label>
        <select id="filterSelect" value={activeFilter} onChange={handleFilterChange}>
          <option value="default">No Filter</option>
          <option value="short">Short Only</option>
          <option value="lazy">Lazy Only</option>
          <option value="lowPriority">Low-Priority</option>
          <option value="highPriority">High-Priority</option>
          <option value="mobile">Mobile-Friendly</option>
        </select>
      </div>
      <br/>
    </>
  )
};

export default Activity;
// Sync Service - Handles localStorage fallback and cloud sync
import { getCurrentUser, syncToCloud, getFromCloud, listenToCloudChanges } from './auth.js';

let isInitialized = false;
let cloudSyncEnabled = false;
let updateInProgress = false;

// Initialize sync service
export async function initSync() {
  if (isInitialized) return;
  
  const user = getCurrentUser();
  if (user) {
    cloudSyncEnabled = true;
    
    // Try to load from cloud first
    const result = await getFromCloud();
    if (result.success && result.data) {
      // Merge cloud data with any existing localStorage data
      const localActivities = JSON.parse(localStorage.getItem('activities') || '[]');
      const localCategories = JSON.parse(localStorage.getItem('categories') || '["None"]');
      const localWipes = JSON.parse(localStorage.getItem('wipes') || '[]');
      const localTheme = localStorage.getItem('theme') || 'dark';
      const localSecrets = JSON.parse(localStorage.getItem('secretArray') || '[]');
      
      // If cloud is empty but local has data, push local to cloud
      if (result.data.activities.length === 0 && localActivities.length > 0) {
        await syncToCloud({
          activities: localActivities,
          categories: localCategories,
          wipes: localWipes,
          theme: localTheme,
          currentTask: JSON.parse(localStorage.getItem('currentTask') || 'null'),
          secrets: localSecrets
        });
      } else {
        // Use cloud data
        localStorage.setItem('activities', JSON.stringify(result.data.activities));
        localStorage.setItem('categories', JSON.stringify(result.data.categories));
        localStorage.setItem('wipes', JSON.stringify(result.data.wipes));
        localStorage.setItem('theme', result.data.theme);
        if (result.data.currentTask) {
          localStorage.setItem('currentTask', JSON.stringify(result.data.currentTask));
        }
        if (result.data.secrets) {
          localStorage.setItem('secretArray', JSON.stringify(result.data.secrets));
        }
      }
      
      // Listen for real-time updates
      listenToCloudChanges((data) => {
        if (!updateInProgress) {
          localStorage.setItem('activities', JSON.stringify(data.activities));
          localStorage.setItem('categories', JSON.stringify(data.categories));
          localStorage.setItem('wipes', JSON.stringify(data.wipes));
          localStorage.setItem('theme', data.theme);
          if (data.currentTask) {
            localStorage.setItem('currentTask', JSON.stringify(data.currentTask));
          } else {
            localStorage.removeItem('currentTask');
          }
          if (data.secrets) {
            localStorage.setItem('secretArray', JSON.stringify(data.secrets));
          }
          
          // Trigger re-render if on manage page
          if (typeof renderActivities === 'function') {
            renderActivities();
          }
        }
      });
    }
  }
  
  isInitialized = true;
}

// Get activities (works with or without auth)
export function getActivities() {
  let activities = localStorage.getItem("activities");
  if (activities) {
    return JSON.parse(activities);
  } else {
    return [
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
  }
}

// Save activities (syncs to cloud if authenticated)
export async function saveActivities(activities) {
  localStorage.setItem("activities", JSON.stringify(activities));
  
  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: activities,
      categories: getCategories(),
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      secrets: getSecrets()
    });
    updateInProgress = false;
  }
}

// Get categories
export function getCategories() {
  let categories = JSON.parse(localStorage.getItem('categories'));
  if (!categories) {
    categories = ['None'];
    localStorage.setItem('categories', JSON.stringify(categories));
  }
  return categories;
}

// Save categories (syncs to cloud if authenticated)
export async function saveCategories(categories) {
  localStorage.setItem('categories', JSON.stringify(categories));
  
  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: categories,
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      secrets: getSecrets()
    });
    updateInProgress = false;
  }
}

// Get wipes
export function getWipes() {
  let wipes = JSON.parse(localStorage.getItem('wipes'));
  if (!wipes) return [];
  return wipes;
}

// Save wipes (syncs to cloud if authenticated)
export async function saveWipes(wipes) {
  localStorage.setItem('wipes', JSON.stringify(wipes));
  
  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: wipes,
      theme: localStorage.getItem('theme') || 'dark',
      secrets: getSecrets()
    });
    updateInProgress = false;
  }
}

// Save theme (syncs to cloud if authenticated)
export async function saveTheme(theme) {
  localStorage.setItem('theme', theme);
  
  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: getWipes(),
      theme: theme,
      secrets: getSecrets()
    });
    updateInProgress = false;
  }
}

// Get theme
export function getTheme() {
  return localStorage.getItem('theme') || 'dark';
}
// Get current task
export function getCurrentTask() {
  const task = localStorage.getItem('currentTask');
  return task ? JSON.parse(task) : null;
}

// Save current task (syncs to cloud if authenticated)
export async function saveCurrentTask(task) {
  if (task) {
    const taskWithTimestamp = {
      ...task,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('currentTask', JSON.stringify(taskWithTimestamp));
  } else {
    localStorage.removeItem('currentTask');
  }
  
  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      currentTask: task ? { ...task, savedAt: new Date().toISOString() } : null,
      secrets: getSecrets()
    });
    updateInProgress = false;
  }
}

// Get secrets
export function getSecrets() {
  const secrets = localStorage.getItem('secretArray');
  return secrets ? JSON.parse(secrets) : [];
}

// Save secrets (syncs to cloud if authenticated)
export async function saveSecrets(secrets) {
  localStorage.setItem('secretArray', JSON.stringify(secrets));
  
  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      currentTask: getCurrentTask(),
      secrets: secrets
    });
    updateInProgress = false;
  }
}

// Sync Service - Handles localStorage fallback and cloud sync
import { getCurrentUser, syncToCloud, getFromCloud, listenToCloudChanges } from './auth.js';

let isInitialized = false;
let cloudSyncEnabled = false;
let updateInProgress = false;

function isOfflineMode() {
  return localStorage.getItem('offlineMode') === 'true';
}

function getLocalUpdatedAtMillis() {
  const updatedAt = localStorage.getItem('updatedAt');
  if (!updatedAt) return 0;
  const parsed = new Date(updatedAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function setLocalUpdatedAt(updatedAt) {
  localStorage.setItem('updatedAt', updatedAt);
  return updatedAt;
}

function getRemoteUpdatedAtMillis(data) {
  if (!data || !data.updatedAt) return 0;
  const parsed = new Date(data.updatedAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Initialize sync service
export async function initSync() {
  if (isInitialized) return;

  if (isOfflineMode()) {
    cloudSyncEnabled = false;
    isInitialized = true;
    return;
  }
  
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
      const localFilter = localStorage.getItem('filter') || 'default';
      const localUpdatedAtMillis = getLocalUpdatedAtMillis();
      const remoteUpdatedAtMillis = getRemoteUpdatedAtMillis(result.data);
      const resolvedUpdatedAt = localUpdatedAtMillis
        ? new Date(localUpdatedAtMillis).toISOString()
        : new Date().toISOString();
      
      // If cloud is empty but local has data, push local to cloud
      if (result.data.activities.length === 0 && localActivities.length > 0) {
        await syncToCloud({
          activities: localActivities,
          categories: localCategories,
          wipes: localWipes,
          theme: localTheme,
          currentTask: JSON.parse(localStorage.getItem('currentTask') || 'null'),
          secrets: localSecrets,
          filter: localFilter,
          updatedAt: setLocalUpdatedAt(resolvedUpdatedAt)
        });
      } else if (localUpdatedAtMillis > remoteUpdatedAtMillis) {
        // Local is newer, push local to cloud
        await syncToCloud({
          activities: localActivities,
          categories: localCategories,
          wipes: localWipes,
          theme: localTheme,
          currentTask: JSON.parse(localStorage.getItem('currentTask') || 'null'),
          secrets: localSecrets,
          filter: localFilter,
          updatedAt: setLocalUpdatedAt(resolvedUpdatedAt)
        });
      } else {
        // Use cloud data (remote is newer or local has no timestamp)
        localStorage.setItem('activities', JSON.stringify(result.data.activities));
        localStorage.setItem('categories', JSON.stringify(result.data.categories));
        localStorage.setItem('wipes', JSON.stringify(result.data.wipes));
        localStorage.setItem('theme', result.data.theme);
        localStorage.setItem('filter', result.data.filter || localFilter);
        if (result.data.updatedAt) {
          setLocalUpdatedAt(result.data.updatedAt);
        }
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
          if (isOfflineMode()) {
            return;
          }
          const localUpdatedAtMillis = getLocalUpdatedAtMillis();
          const remoteUpdatedAtMillis = getRemoteUpdatedAtMillis(data);
          if (remoteUpdatedAtMillis && localUpdatedAtMillis && remoteUpdatedAtMillis <= localUpdatedAtMillis) {
            return;
          }
          localStorage.setItem('activities', JSON.stringify(data.activities));
          localStorage.setItem('categories', JSON.stringify(data.categories));
          localStorage.setItem('wipes', JSON.stringify(data.wipes));
          localStorage.setItem('theme', data.theme);
          localStorage.setItem('filter', data.filter || 'default');
          if (data.updatedAt) {
            setLocalUpdatedAt(data.updatedAt);
          }
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
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  localStorage.setItem("activities", JSON.stringify(activities));
  
  if (!isOfflineMode() && cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: activities,
      categories: getCategories(),
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      secrets: getSecrets(),
      filter: getFilter(),
      updatedAt: updatedAt
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
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  localStorage.setItem('categories', JSON.stringify(categories));
  
  if (!isOfflineMode() && cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: categories,
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      secrets: getSecrets(),
      filter: getFilter(),
      updatedAt: updatedAt
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
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  localStorage.setItem('wipes', JSON.stringify(wipes));
  
  if (!isOfflineMode() && cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: wipes,
      theme: localStorage.getItem('theme') || 'dark',
      secrets: getSecrets(),
      filter: getFilter(),
      updatedAt: updatedAt
    });
    updateInProgress = false;
  }
}

// Save theme (syncs to cloud if authenticated)
export async function saveTheme(theme) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  localStorage.setItem('theme', theme);
  
  if (!isOfflineMode() && cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: getWipes(),
      theme: theme,
      secrets: getSecrets(),
      filter: getFilter(),
      updatedAt: updatedAt
    });
    updateInProgress = false;
  }
}

// Get theme
export function getTheme() {
  return localStorage.getItem('theme') || 'dark';
}

// Get filter
export function getFilter() {
  return localStorage.getItem('filter') || 'default';
}

// Save filter (syncs to cloud if authenticated)
export async function saveFilter(filter) {
  const nextFilter = filter || 'default';
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  localStorage.setItem('filter', nextFilter);
  
  if (!isOfflineMode() && cloudSyncEnabled && getCurrentUser()) {
    const currentTask = await getCurrentTask();
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      currentTask: currentTask,
      secrets: getSecrets(),
      filter: nextFilter,
      updatedAt: updatedAt
    });
    updateInProgress = false;
  }
}
// Get current task
export async function getCurrentTask() {
  if (isOfflineMode() || !cloudSyncEnabled || !getCurrentUser()) {
    console.log('Offline mode or no cloud sync - getting current task from localStorage');
    const task = localStorage.getItem('currentTask');
    return task ? JSON.parse(task) : null;
  }

  const result = await getFromCloud();
  if (result.success && result.data) {
    const task = result.data.currentTask || null;
    if (task) {
      localStorage.setItem('currentTask', JSON.stringify(task));
    } else {
      localStorage.removeItem('currentTask');
    }
    return task;
  }

  const fallback = localStorage.getItem('currentTask');
  return fallback ? JSON.parse(fallback) : null;
}

// Save current task (syncs to cloud if authenticated)
export async function saveCurrentTask(task) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (task) {
    const taskWithTimestamp = {
      ...task,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('currentTask', JSON.stringify(taskWithTimestamp));
  } else {
    localStorage.removeItem('currentTask');
  }
  
  if (!isOfflineMode() && cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      currentTask: task ? { ...task, savedAt: new Date().toISOString() } : null,
      secrets: getSecrets(),
      filter: getFilter(),
      updatedAt: updatedAt
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
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  localStorage.setItem('secretArray', JSON.stringify(secrets));
  
  if (!isOfflineMode() && cloudSyncEnabled && getCurrentUser()) {
    const currentTask = await getCurrentTask();
    updateInProgress = true;
    await syncToCloud({
      activities: getActivities(),
      categories: getCategories(),
      wipes: getWipes(),
      theme: localStorage.getItem('theme') || 'dark',
      currentTask: currentTask,
      secrets: secrets,
      filter: getFilter(),
      updatedAt: updatedAt
    });
    updateInProgress = false;
  }
}

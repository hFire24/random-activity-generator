// Sync Service - Handles localStorage fallback and cloud sync
import { getCurrentUser, syncToCloud, getFromCloud, listenToCloudChanges } from './auth.js';

let isInitialized = false;
let cloudSyncEnabled = false;
let updateInProgress = false;

const cache = {
  activities: [],
  categories: ['None'],
  wipes: [],
  theme: 'dark',
  currentTask: null,
  secrets: [],
  filter: 'default',
  completedActivities: [],
  skippedActivities: [],
  onHoldTasks: [],
  nextResetTime: null,
  updatedAt: null
};

export function isOfflineModeEnabled() {
  return localStorage.getItem('offlineMode') === 'true';
}

function isOfflineMode() {
  return isOfflineModeEnabled();
}

function applyCloudData(data) {
  cache.activities = Array.isArray(data?.activities) ? data.activities : [];
  cache.categories = Array.isArray(data?.categories) && data.categories.length > 0 ? data.categories : ['None'];
  cache.wipes = Array.isArray(data?.wipes) ? data.wipes : [];
  cache.theme = data?.theme || 'dark';
  cache.currentTask = data?.currentTask || null;
  cache.secrets = Array.isArray(data?.secrets) ? data.secrets : [];
  cache.filter = data?.filter || 'default';
  cache.completedActivities = Array.isArray(data?.completedActivities) ? data.completedActivities : [];
  cache.skippedActivities = Array.isArray(data?.skippedActivities) ? data.skippedActivities : [];
  cache.onHoldTasks = Array.isArray(data?.onHoldTasks) ? data.onHoldTasks : [];
  cache.nextResetTime = data?.nextResetTime || null;
  cache.updatedAt = data?.updatedAt || null;
}

function loadCacheFromLocalStorage() {
  cache.activities = JSON.parse(localStorage.getItem('activities') || '[]');
  cache.categories = JSON.parse(localStorage.getItem('categories') || '["None"]');
  cache.wipes = JSON.parse(localStorage.getItem('wipes') || '[]');
  cache.theme = localStorage.getItem('theme') || 'dark';
  cache.currentTask = JSON.parse(localStorage.getItem('currentTask') || 'null');
  cache.secrets = JSON.parse(localStorage.getItem('secretArray') || '[]');
  cache.filter = localStorage.getItem('filter') || 'default';
  cache.completedActivities = JSON.parse(localStorage.getItem('completedActivities') || '[]');
  cache.skippedActivities = JSON.parse(localStorage.getItem('skippedActivities') || '[]');
  cache.onHoldTasks = JSON.parse(localStorage.getItem('onHoldTasks') || '[]');
  cache.nextResetTime = localStorage.getItem('nextResetTime') || null;
  cache.updatedAt = localStorage.getItem('updatedAt') || null;
}

function buildSyncPayload(overrides = {}) {
  return {
    activities: cache.activities,
    categories: cache.categories,
    wipes: cache.wipes,
    theme: cache.theme,
    currentTask: cache.currentTask,
    secrets: cache.secrets,
    filter: cache.filter,
    completedActivities: cache.completedActivities,
    skippedActivities: cache.skippedActivities,
    onHoldTasks: cache.onHoldTasks,
    nextResetTime: cache.nextResetTime,
    updatedAt: cache.updatedAt,
    ...overrides
  };
}

function getLocalUpdatedAtMillis() {
  if (isOfflineMode()) {
    const updatedAt = localStorage.getItem('updatedAt');
    if (!updatedAt) return 0;
    const parsed = new Date(updatedAt).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  const updatedAt = cache.updatedAt;
  if (!updatedAt) return 0;
  const parsed = new Date(updatedAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function setLocalUpdatedAt(updatedAt) {
  if (isOfflineMode()) {
    localStorage.setItem('updatedAt', updatedAt);
  }
  cache.updatedAt = updatedAt;
  return updatedAt;
}

function getRemoteUpdatedAtMillis(data) {
  if (!data || !data.updatedAt) return 0;
  const parsed = new Date(data.updatedAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

// Initialize sync service
export async function initSync() {
  if (isInitialized) {
    if (isOfflineMode() || cloudSyncEnabled) {
      return;
    }
  }

  if (isOfflineMode()) {
    cloudSyncEnabled = false;
    loadCacheFromLocalStorage();
    isInitialized = true;
    return;
  }
  
  const user = getCurrentUser();
  if (!user) {
    cloudSyncEnabled = false;
    isInitialized = false;
    return;
  }

  if (user) {
    cloudSyncEnabled = true;
    
    // Load from cloud only
    const result = await getFromCloud();
    if (result.success && result.data) {
      applyCloudData(result.data);
      
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
          applyCloudData(data);

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cloudSyncUpdated'));
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
  if (isOfflineMode()) {
    let activities = localStorage.getItem("activities");
    if (activities) {
      return JSON.parse(activities);
    }
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

  return cache.activities;
}

// Save activities (syncs to cloud if authenticated)
export async function saveActivities(activities) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem("activities", JSON.stringify(activities));
    return;
  }

  cache.activities = activities;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ activities, updatedAt }));
    updateInProgress = false;
  }
}

// Get categories
export function getCategories() {
  if (isOfflineMode()) {
    let categories = JSON.parse(localStorage.getItem('categories'));
    if (!categories) {
      categories = ['None'];
      localStorage.setItem('categories', JSON.stringify(categories));
    }
    return categories;
  }
  return cache.categories;
}

// Save categories (syncs to cloud if authenticated)
export async function saveCategories(categories) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('categories', JSON.stringify(categories));
    return;
  }

  cache.categories = categories;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ categories, updatedAt }));
    updateInProgress = false;
  }
}

// Get wipes
export function getWipes() {
  if (isOfflineMode()) {
    let wipes = JSON.parse(localStorage.getItem('wipes'));
    if (!wipes) return [];
    return wipes;
  }
  return cache.wipes;
}

// Save wipes (syncs to cloud if authenticated)
export async function saveWipes(wipes) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('wipes', JSON.stringify(wipes));
    return;
  }

  cache.wipes = wipes;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ wipes, updatedAt }));
    updateInProgress = false;
  }
}

// Save theme (syncs to cloud if authenticated)
export async function saveTheme(theme) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('theme', theme);
    return;
  }

  cache.theme = theme;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ theme, updatedAt }));
    updateInProgress = false;
  }
}

// Get theme
export function getTheme() {
  if (isOfflineMode()) {
    return localStorage.getItem('theme') || 'dark';
  }
  return cache.theme || 'dark';
}

// Get filter
export function getFilter() {
  if (isOfflineMode()) {
    return localStorage.getItem('filter') || 'default';
  }
  return cache.filter || 'default';
}

// Save filter (syncs to cloud if authenticated)
export async function saveFilter(filter) {
  const nextFilter = filter || 'default';
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('filter', nextFilter);
    return;
  }

  cache.filter = nextFilter;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ filter: nextFilter, updatedAt }));
    updateInProgress = false;
  }
}
// Get current task
export async function getCurrentTask() {
  if (isOfflineMode()) {
    console.log('Offline mode - getting current task from localStorage');
    const task = localStorage.getItem('currentTask');
    return task ? JSON.parse(task) : null;
  }

  if (!isInitialized) {
    await initSync();
  }

  if (cloudSyncEnabled && getCurrentUser()) {
    return cache.currentTask || null;
  }

  return cache.currentTask || null;
}

// Save current task (syncs to cloud if authenticated)
export async function saveCurrentTask(task) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  const taskWithTimestamp = task
    ? {
        ...task,
        savedAt: new Date().toISOString()
      }
    : null;

  if (isOfflineMode()) {
    if (taskWithTimestamp) {
      localStorage.setItem('currentTask', JSON.stringify(taskWithTimestamp));
    } else {
      localStorage.removeItem('currentTask');
    }
    return;
  }

  cache.currentTask = taskWithTimestamp;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ currentTask: taskWithTimestamp, updatedAt }));
    updateInProgress = false;
  }
}

// Get secrets
export function getSecrets() {
  if (isOfflineMode()) {
    const secrets = localStorage.getItem('secretArray');
    return secrets ? JSON.parse(secrets) : [];
  }
  return cache.secrets;
}

// Save secrets (syncs to cloud if authenticated)
export async function saveSecrets(secrets) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('secretArray', JSON.stringify(secrets));
    return;
  }

  cache.secrets = secrets;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ secrets, updatedAt }));
    updateInProgress = false;
  }
}

// Completed activities
export function getCompletedActivities() {
  if (isOfflineMode()) {
    return JSON.parse(localStorage.getItem('completedActivities') || '[]');
  }
  return cache.completedActivities;
}

export async function saveCompletedActivities(completedActivities) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('completedActivities', JSON.stringify(completedActivities));
    return;
  }

  cache.completedActivities = completedActivities;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ completedActivities, updatedAt }));
    updateInProgress = false;
  }
}

// Skipped activities
export function getSkippedActivities() {
  if (isOfflineMode()) {
    return JSON.parse(localStorage.getItem('skippedActivities') || '[]');
  }
  return cache.skippedActivities;
}

export async function saveSkippedActivities(skippedActivities) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('skippedActivities', JSON.stringify(skippedActivities));
    return;
  }

  cache.skippedActivities = skippedActivities;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ skippedActivities, updatedAt }));
    updateInProgress = false;
  }
}

// On-hold tasks
export function getOnHoldTasks() {
  if (isOfflineMode()) {
    return JSON.parse(localStorage.getItem('onHoldTasks') || '[]');
  }
  return cache.onHoldTasks;
}

export async function saveOnHoldTasks(onHoldTasks) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    localStorage.setItem('onHoldTasks', JSON.stringify(onHoldTasks));
    return;
  }

  cache.onHoldTasks = onHoldTasks;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ onHoldTasks, updatedAt }));
    updateInProgress = false;
  }
}

// Next reset time
export function getNextResetTime() {
  if (isOfflineMode()) {
    return localStorage.getItem('nextResetTime') || null;
  }
  return cache.nextResetTime;
}

export async function saveNextResetTime(nextResetTime) {
  const updatedAt = setLocalUpdatedAt(new Date().toISOString());
  if (isOfflineMode()) {
    if (nextResetTime) {
      localStorage.setItem('nextResetTime', nextResetTime);
    } else {
      localStorage.removeItem('nextResetTime');
    }
    return;
  }

  cache.nextResetTime = nextResetTime;
  cache.updatedAt = updatedAt;

  if (cloudSyncEnabled && getCurrentUser()) {
    updateInProgress = true;
    await syncToCloud(buildSyncPayload({ nextResetTime, updatedAt }));
    updateInProgress = false;
  }
}

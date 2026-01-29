// Import sync functions (will be loaded via module script)
// These functions are now in sync.js
import { getActivities, saveTheme, getTheme } from './sync.js';

// Re-export for backwards compatibility
window.getActivities = getActivities;

function changeTheme() {
  const theme = document.getElementById("themeSelector").value;
  document.body.className = theme;
  saveTheme(theme);
}

function loadTheme() {
  const theme = getTheme();
  document.body.className = theme;
  if (document.getElementById("themeSelector")) {
    document.getElementById("themeSelector").value = theme;
  }
}
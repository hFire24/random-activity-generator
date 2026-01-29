// theme.js - Standalone theme functions for non-module pages

function changeTheme() {
  const theme = document.getElementById('themeSelector').value;
  document.body.className = theme;
  localStorage.setItem('theme', theme);
}

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'original';
  document.body.className = theme;
  const selector = document.getElementById('themeSelector');
  if (selector) {
    selector.value = theme;
  }
}

window.onload = loadTheme;

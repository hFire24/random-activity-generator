import React, { useState, useEffect } from "react";

const ThemeSelector = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Load theme from localStorage or default to dark mode
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);

    // Apply theme to body
    document.body.className = savedTheme;
  }, []);

  function changeTheme(event) {
    const newTheme = event.target.value;
    // Save theme to localStorage
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  }

  useEffect(() => {
    // Apply theme to body
    document.body.className = theme;
  }, [theme]);

  return (
    <div className="theme-selector">
      <h3>Theme Selector</h3>
      <form id='themeSelector'>
        <select id="theme" value={theme} onChange={changeTheme}>
          <option value="original">Original Theme</option>
          <option value="dark">Dark Theme</option>
          <option value="digital">Digital Theme</option>
        </select>
      </form>
    </div>
  );
};

export default ThemeSelector;
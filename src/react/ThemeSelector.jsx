import React, { useState, useEffect } from "react";
import { getTheme, saveTheme, initSync, isOfflineModeEnabled } from "../../sync.js";

const ThemeSelector = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    let isMounted = true;
    const loadTheme = async () => {
      if (!isOfflineModeEnabled()) {
        await initSync();
      }
      const savedTheme = getTheme() || "dark";
      if (!isMounted) return;
      setTheme(savedTheme);
      document.body.className = savedTheme;
    };

    loadTheme();
    return () => {
      isMounted = false;
    };
  }, []);

  function changeTheme(event) {
    const newTheme = event.target.value;
    void saveTheme(newTheme);
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
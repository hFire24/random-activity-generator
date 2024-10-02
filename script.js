function getActivities() {
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

function changeTheme() {
  const theme = document.getElementById("themeSelector").value;
  document.body.className = theme;
  localStorage.setItem('theme', theme);
}

function loadTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.className = theme;
  document.getElementById("themeSelector").value = theme;
}
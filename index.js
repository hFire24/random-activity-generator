function markAsCompleted() {
  const activities = getActivities().filter((activity) => !activity.archived);
  if (activities.length === 0) return;

  // Get the current activity based on the text content on the webpage
  const activityText = document.getElementById("activity").innerHTML;
  const activity = activities.find(
    (activity) => activity.text === activityText
  );

  if (!activity) return;

  activity.timesCompleted += 1;
  activity.timesSkippedConsecutively = 0;

  // Add to completed activities array
  addToTemporaryArray("completedActivities", activity.text);

  // Save the activity back to localStorage
  saveActivity(activity);

  // Load a new activity
  generateActivity();
}

function skipTask() {
  const activities = getActivities().filter((activity) => !activity.archived);
  if (activities.length === 0) return;

  // Get the current activity based on the text content on the webpage
  const activityText = document.getElementById("activity").innerHTML;
  const activity = activities.find(
    (activity) => activity.text === activityText
  );

  if (!activity) return;

  activity.timesSkipped += 1;
  activity.timesSkippedConsecutively += 1;

  // Add to skipped activities array
  addToTemporaryArray("skippedActivities", activity.text);

  // Save the activity back to localStorage
  saveActivity(activity);

  // Load a new activity
  generateActivity();
}

function addToTemporaryArray(arrayName, activityText) {
  let tempArray = sessionStorage.getItem(arrayName)
    ? JSON.parse(sessionStorage.getItem(arrayName))
    : [];
  if (!tempArray.includes(activityText)) {
    tempArray.push(activityText);
    sessionStorage.setItem(arrayName, JSON.stringify(tempArray));
  }
}

function saveActivity(updatedActivity) {
  const activities = getActivities();
  const activityIndex = activities.findIndex(
    (activity) => activity.text === updatedActivity.text
  );

  if (activityIndex !== -1) {
    activities[activityIndex] = updatedActivity;
    localStorage.setItem("activities", JSON.stringify(activities));
  }
}

function generateActivity() {
  const activities = getActivities().filter(
    (activity) =>
      !activity.archived && !isActivityInTemporaryArray(activity.text)
  );
  const previousActivityText = document.getElementById("activity").innerHTML;

  if (activities.length === 0) {
    const skippedActivities = JSON.parse(
      sessionStorage.getItem("skippedActivities") || "[]"
    );

    if (skippedActivities.length > 0) {
      sessionStorage.removeItem("skippedActivities");
      generateActivity(); // Retry after clearing skipped activities
    } else {
      document.getElementById("activity").innerHTML =
        "No more activities to load.";
    }
  } else {
    let randomActivity;
    do {
      randomActivity = activities[Math.floor(Math.random() * activities.length)];
    } while (randomActivity.text === previousActivityText && activities.length > 1);
    const activityElement = document.getElementById("activity");
    activityElement.innerHTML = randomActivity.text;
    if (randomActivity.link !== null) {
      const link = randomActivity.link;
      console.log(link);
      // If there's a link, make the text clickable and add hover effect
      activityElement.style.cursor = "pointer";
      activityElement.style.textDecoration = "underline";
      activityElement.onclick = function() {
        window.open(link, '_blank'); // Open in a new tab
      };
    } else {
      // If there's no link, ensure the text isn't clickable and remove hover effect
      activityElement.style.cursor = "default";
      activityElement.style.textDecoration = "none";
      activityElement.onclick = null;
    }
  }
}

function isActivityInTemporaryArray(activityText) {
  const skippedActivities = JSON.parse(
    sessionStorage.getItem("skippedActivities") || "[]"
  );
  const completedActivities = JSON.parse(
    sessionStorage.getItem("completedActivities") || "[]"
  );
  return (
    skippedActivities.includes(activityText) ||
    completedActivities.includes(activityText)
  );
}

window.onload = function () {
  loadTheme();
  generateActivity();
};

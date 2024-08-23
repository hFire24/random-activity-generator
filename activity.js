let activities = getActivities().filter((activity) => !activity.archived);
let standingActivityPending = false;
let currentActivity = null;

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
  const activityElement = document.getElementById("activity");
  const activities = getActivities().filter(
    (activity) =>
      !activity.archived && !isActivityInTemporaryArray(activity.text)
  );
  const previousActivityText = activityElement.innerHTML;

  if (activities.length === 0) {
    const skippedActivities = JSON.parse(
      sessionStorage.getItem("skippedActivities") || "[]"
    );

    if (skippedActivities.length > 0) {
      sessionStorage.removeItem("skippedActivities");
      generateActivity(); // Retry after clearing skipped activities
    } else {
      activityElement.innerHTML = "No more activities to load.";
    }
  } else {
    let randomActivity;
    do {
      randomActivity =
        activities[Math.floor(Math.random() * activities.length)];
    } while (
      randomActivity.text === previousActivityText &&
      activities.length > 1
    );
    currentActivity = randomActivity;
    if (currentActivity.standingTask && !standingActivityPending) {
      activityElement.innerHTML = "Stand up and stretch if you can.";
      activityElement.style.cursor = "pointer";
      activityElement.style.textDecoration = "underline";
      activityElement.onclick = function () {
        displayActivity(currentActivity);
        document.querySelector(".activity-button").style.display = "inline";
        document.querySelector(".skip-button").style.display = "inline";
      };
      standingActivityPending = true;
      document.querySelector(".activity-button").style.display = "none";
      document.querySelector(".skip-button").style.display = "none";
    } else {
      displayActivity(currentActivity);
    }
  }
}

function displayActivity(activity) {
  const activityElement = document.getElementById("activity");
  activityElement.innerHTML = activity.text;

  if (activity.link !== null) {
    const link = activity.link;
    console.log(link);
    // If there's a link, make the text clickable and add hover effect
    activityElement.style.cursor = "pointer";
    activityElement.style.textDecoration = "underline";
    activityElement.onclick = function () {
      window.open(link, "_blank"); // Open in a new tab
    };
  } else {
    // If there's no link, ensure the text isn't clickable and remove hover effect
    activityElement.style.cursor = "default";
    activityElement.style.textDecoration = "none";
    activityElement.onclick = null;
  }

  standingActivityPending = false; // Reset after showing the task
}

function markAsCompleted() {
  if (!currentActivity) return;

  currentActivity.timesCompleted += 1;
  currentActivity.timesSkippedConsecutively = 0;

  // Add to completed activities array
  addToTemporaryArray("completedActivities", currentActivity.text);

  // Save the activity back to localStorage
  saveActivity(currentActivity);

  // Load a new activity
  generateActivity();
}

function skipTask() {
  if (!currentActivity) return;

  currentActivity.timesSkipped += 1;
  currentActivity.timesSkippedConsecutively += 1;

  // Add to skipped activities array
  addToTemporaryArray("skippedActivities", currentActivity.text);

  // Save the activity back to localStorage
  saveActivity(currentActivity);

  // Load a new activity
  generateActivity();
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

function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function filterActivities(option) {
  switch (option) {
    case "highPriority":
      activities = activities.filter((activity) => activity.importance > 1);
      break;
    case "lowPriority":
      activities = activities.filter((activity) => activity.importance <= 2);
      break;
    case "lazy":
      activities = activities.filter((activity) => !activity.activeTask);
      break;
    case "short":
      activities = activities.filter((activity) => !activity.longTask);
      break;
    case "onTheGo":
      activities = activities.filter((activity) => activity.mobileFriendlyTask);
      break;
    default:
      break;
  }
}

window.onload = function () {
  loadTheme();

  const selectedFilter = getQueryParameter("filter") || "default";
  filterActivities(selectedFilter);
  generateActivity();
};

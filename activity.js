let activities = getActivities().filter((activity) => !activity.archived);
let standingActivityPending = false;
let currentActivity = null;
let completedActivities = [];
let skippedActivities = [];
let wipedCategories = JSON.parse(localStorage.getItem('wipes')) || [];
let timesSkippedConsecutively = 0;
let customActivity = null;
let bedtimeEnabled = true;
let sleep = 22;
let wake = 6;

if(isBedtime(sleep, wake - 1) && bedtimeEnabled) {
  activities.push({
    text: "Wear your pajamas and go to bed.",
    link: null,
    category: "sleep",
    importance: 3,
    standingTask: true,
    activeTask: false,
    longTask: false,
    mobileFriendlyTask: true,
    timesCompleted: 0,
    timesSkipped: 0,
    dateCreated: new Date().toISOString(),
    archived: false
  });
}

function isBedtime(sleep, wake) {
  const d = new Date();
  return (sleep > wake) ? (d.getHours() < wake || d.getHours() >= sleep) : (d.getHours >= sleep && d.getHours() < wake);
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
  activities = activities.filter(
    (activity) => !isActivityInTemporaryArray(activity.text)
  );

  console.log(activities.length);

  if (activities.length === 0 && customActivity === null) {
    if (skippedActivities.length > 0) {
      activities = getActivities().filter((activity) =>
        skippedActivities.includes(activity.text)
      );
      skippedActivities = [];
      generateActivity(); // Retry after clearing skipped activities
    } else {
      activityElement.innerHTML = "No more activities to load.";
      activityElement.style.cursor = "default";
      activityElement.style.textDecoration = "none";
      activityElement.onclick = null;
    }
  } else {
    const savedActivityText = sessionStorage.getItem("currentActivity");
    const savedActivity = activities.find(
      (activity) => activity.text === savedActivityText
    );
    if (savedActivity) {
      currentActivity = savedActivity;
    } else if (customActivity !== null) {
      currentActivity = { text: customActivity, link: null, standingTask: false };
      sessionStorage.setItem("currentActivity", currentActivity.text);
    }
    else {
      const previousActivityText = activityElement.innerHTML;
      let randomActivity;
      do {
        randomActivity =
          activities[Math.floor(Math.random() * activities.length)];
      } while (
        randomActivity.text === previousActivityText &&
        activities.length > 1
      );
      // There is at least a 1 in 4 chance of the sleep message appearing at bedtime.
      if(isBedtime(sleep, wake - 1) && !Math.floor(Math.random() * 4) && activities[activities.length - 1].category === "sleep")
        randomActivity = activities[activities.length - 1];
      currentActivity = randomActivity;
      sessionStorage.setItem("currentActivity", currentActivity.text);
    }
    currentActivity.standingTask && !standingActivityPending ? displayStand(currentActivity) : displayActivity(currentActivity);
  }
}

function displayStand(currentActivity) {
  const activityElement = document.getElementById("activity");
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

  if (customActivity === null && !completedActivities.includes(currentActivity.text) && currentActivity.category !== "sleep") {
    currentActivity.timesCompleted += 1;
    timesSkippedConsecutively = 0;

    // Add to completed activities array
    completedActivities.push(currentActivity.text);

    // Save the activity back to localStorage
    saveActivity(currentActivity);

    // If the current activity category is wiped, handle all activities in that category
    if (wipedCategories.includes(currentActivity.category)) {
      handleWipedCategory(currentActivity.category, true);
    }
  } else if(currentActivity.category === "sleep") {
    activities.pop();
  }

  // Ask for a custom activity if needed
  if (confirm("Got something you need to do?")) {
    customActivity = prompt("Type in the task you need to do.");
    if (filtered(customActivity)) customActivity = null;
  } else {
    customActivity = null;
  }

  // Load a new activity
  generateActivity();
}

function skipTask() {
  if (!currentActivity) return;

  if (customActivity === null && !skippedActivities.includes(currentActivity.text) && currentActivity.category !== "sleep") {
    currentActivity.timesSkipped += 1;
    timesSkippedConsecutively += 1;

    // Add to skipped activities array
    skippedActivities.push(currentActivity.text);

    // Save the activity back to localStorage
    saveActivity(currentActivity);

    // If the current activity category is wiped, handle all activities in that category
    if (wipedCategories.includes(currentActivity.category)) {
      handleWipedCategory(currentActivity.category, false);
    }
  } else if(currentActivity.category === "sleep") {
    activities.pop();
  }

  // Ask for a custom activity if needed
  if (confirm("Got something you need to do?")) {
    customActivity = prompt("Type in the task you need to do.");
    if (filtered(customActivity)) customActivity = null;
  } else {
    customActivity = null;
  }

  // Load a new activity
  generateActivity();
}

function handleWipedCategory(category, completed) {
  // Loop through all activities and find those that belong to the wiped category
  activities.forEach(activity => {
    if (activity.category === category) {
      if(completed) {
        if (!completedActivities.includes(activity.text)) {
          completedActivities.push(activity.text);
        }
      }
      else {
        if (!skippedActivities.includes(activity.text)) {
          skippedActivities.push(activity.text);
        }
      }
    }
  });
}

function filtered(customActivity) {
  let rValue = true;
  let newBreakLC = customActivity.toLowerCase();
  
  // Assuming secretArray is loaded from privateData.js
  if (foundInSecretArray(newBreakLC) || newBreakLC.endsWith(" rem")) {
    alert("That should not be a priority.");
  } else if (found(['bored', 'bore', 'lazy', 'nothing', 'don\'t feel like doing', 'uhh', 'umm', 'hmm',
    'lack of interest', 'don\'t know', 'don’t know', 'dunno', 'no idea', 'no reason', 'idk'], newBreakLC)
    || customActivity.length === 0) {
    rValue = true;
  } else {
    rValue = false;
  }
  return rValue;
}

function found(array, value) {
  return array.some(item => value.includes(item));
}

function foundInSecretArray(value) {
  let secretArray = JSON.parse(localStorage.getItem('secretArray'));
  return secretArray.some(item => value.includes(item));
}

function isActivityInTemporaryArray(activityText) {
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

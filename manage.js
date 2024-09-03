let currentEditIndex = null;
let currentAction = null;

function renderActivities() {
  const activities = getActivities();
  const activitiesContainer = document.getElementById("activitiesContainer");
  activitiesContainer.innerHTML = "";

  activities.forEach((activity, index) => {
    const activityDiv = document.createElement("div");
    activityDiv.className = "activity-list-item";
    activityDiv.innerHTML = `
            <span class="drag-handle">☰</span>
            <span class="task-name">${activity.text}</span>
            <button class="green" onclick="openPopup(${index})">Edit</button>
            ${
              activity.archived
                ? `
                <button class="blue" onclick="unarchiveActivity(${index})">Unarchive</button>
                <button class="red" onclick="confirmDelete(${index})">Delete</button>
            `
                : `
                <button class="blue" onclick="duplicateActivity(${index})">Duplicate</button>
                <button class="red" onclick="confirmArchive(${index})">Archive</button>
            `
            }
        `;
    activitiesContainer.appendChild(activityDiv);
  });

  setupDragAndDrop();
}

function addActivity() {
  const activities = getActivities();
  openPopup(activities.length);
}

function toggleAdvancedOptions() {
  const advancedOptions = document.getElementById("advancedOptions");
  const button = document.querySelector(".advanced-options-btn");
  if (advancedOptions.style.display === "block") {
    advancedOptions.style.display = "none";
    button.textContent = "Advanced Options";
  } else {
    advancedOptions.style.display = "block";
    button.textContent = "Basic Options";
  }
}

function updateImportance(sliderId, labelId) {
  const slider = document.getElementById(sliderId);
  const label = document.getElementById(labelId);
  label.textContent = `Importance (${slider.value})`;
}

function updateLabel(toggleId, labelId, onEmoji, offEmoji) {
  const toggle = document.getElementById(toggleId);
  const label = document.getElementById(labelId);
  const textLabel = document.getElementById(labelId.replace("Label", "Text"));
  const labels = {
    standingLabel: ["Standing Task", "Sitting Task"],
    activeLabel: ["Active Task", "Lazy Task"],
    longLabel: ["Long Task", "Short Task"],
    mobileLabel: ["Mobile-Friendly Task", "Home Task"],
  };

  label.textContent = toggle.checked ? onEmoji : offEmoji;
  textLabel.textContent = toggle.checked
    ? labels[labelId][0]
    : labels[labelId][1];
}

function openPopup(index) {
  const activities = getActivities();
  const activity = activities[index];

  currentEditIndex = index;
  if (activity === undefined) {
    document.getElementById("popupText").value = "";
    document.getElementById("popupLink").value = "";
    document.getElementById("popupCategory").value = "";
    document.getElementById("popupImportance").value = 1;
    document.getElementById("popupStandingTask").checked = false;
    document.getElementById("popupActiveTask").checked = false;
    document.getElementById("popupLongTask").checked = false;
    document.getElementById("popupMobileFriendlyTask").checked = false;
  } else {
    document.getElementById("popupText").value = activity.text;
    document.getElementById("popupLink").value = activity.link || "";
    document.getElementById("popupCategory").value = activity.category || "";
    document.getElementById("popupImportance").value = activity.importance;
    document.getElementById("popupStandingTask").checked =
      activity.standingTask;
    document.getElementById("popupActiveTask").checked = activity.activeTask;
    document.getElementById("popupLongTask").checked = activity.longTask;
    document.getElementById("popupMobileFriendlyTask").checked =
      activity.mobileFriendlyTask;
  }

  updateImportance("popupImportance", "importanceLabel");
  updateLabel("popupStandingTask", "standingLabel", "🦵", "🪑");
  updateLabel("popupActiveTask", "activeLabel", "🏃‍♂️", "😴");
  updateLabel("popupLongTask", "longLabel", "⏳", "⏱️");
  updateLabel("popupMobileFriendlyTask", "mobileLabel", "📱", "🏠");

  document.getElementById("popupOverlay").style.display = "block";
  document.getElementById("popupWindow").style.display = "block";
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
  document.getElementById("popupWindow").style.display = "none";
  currentEditIndex = null;
}

function saveChanges() {
  const activities = getActivities();

  if (currentEditIndex !== null) {
    activities[currentEditIndex] = {
      ...activities[currentEditIndex],
      text: document.getElementById("popupText").value,
      link: document.getElementById("popupLink").value || null,
      category: document.getElementById("popupCategory").value || null,
      importance: parseInt(document.getElementById("popupImportance").value),
      standingTask: document.getElementById("popupStandingTask").checked,
      activeTask: document.getElementById("popupActiveTask").checked,
      longTask: document.getElementById("popupLongTask").checked,
      mobileFriendlyTask: document.getElementById("popupMobileFriendlyTask")
        .checked,
    };
  } else {
    activities.push({
      text: document.getElementById("popupText").value,
      link: document.getElementById("popupLink").value || null,
      category: document.getElementById("popupCategory").value || null,
      importance: parseInt(document.getElementById("popupImportance").value),
      standingTask: document.getElementById("popupStandingTask").checked,
      activeTask: document.getElementById("popupActiveTask").checked,
      longTask: document.getElementById("popupLongTask").checked,
      mobileFriendlyTask: document.getElementById("popupMobileFriendlyTask")
        .checked,
      timesCompleted: 0,
      timesSkipped: 0,
      timesSkippedConsecutively: 0,
      dateCreated: new Date().toISOString(),
      archived: false,
    });
  }

  localStorage.setItem("activities", JSON.stringify(activities));
  closePopup();
  renderActivities();
}

function confirmArchive(index) {
  currentAction = { type: "archive", index };
  showConfirmationDialog("Are you sure you want to archive this task?");
}

function confirmDelete(index) {
  currentAction = { type: "delete", index };
  showConfirmationDialog("Are you sure you want to delete this task?");
}

function showConfirmationDialog(message) {
  document.getElementById("confirmationText").innerText = message;
  document.getElementById("confirmationDialog").style.display = "block";
  document.getElementById("popupOverlay").style.display = "block";
}

function confirmAction() {
  const activities = getActivities();

  if (currentAction.type === "archive") {
    activities[currentAction.index].archived = true;
  } else if (
    currentAction.type === "delete" &&
    activities[currentAction.index].archived
  ) {
    activities.splice(currentAction.index, 1);
  }

  localStorage.setItem("activities", JSON.stringify(activities));
  closeConfirmationDialog();
  renderActivities();
}

function cancelAction() {
  closeConfirmationDialog();
}

function closeConfirmationDialog() {
  document.getElementById("confirmationDialog").style.display = "none";
  document.getElementById("popupOverlay").style.display = "none";
  currentAction = null;
}

function duplicateActivity(index) {
  const activities = getActivities();
  const activityToDuplicate = activities[index];
  const duplicatedActivity = {
    ...activityToDuplicate,
    timesCompleted: 0,
    timesSkipped: 0,
    timesSkippedConsecutively: 0,
    dateCreated: new Date().toISOString(),  // Optionally reset the creation date
  };
  activities.splice(index + 1, 0, duplicatedActivity);
  // Create a new activity and insert
  localStorage.setItem("activities", JSON.stringify(activities));
  renderActivities();
}

function unarchiveActivity(index) {
  const activities = getActivities();
  activities[index].archived = false;
  localStorage.setItem("activities", JSON.stringify(activities));
  renderActivities();
}

function setupDragAndDrop() {
  const dragHandles = document.querySelectorAll(".drag-handle");
  dragHandles.forEach((handle, index) => {
    handle.parentElement.setAttribute("draggable", "true"); // Make the whole activity item draggable
    handle.parentElement.setAttribute("data-index", index); // Set the index as a data attribute
    handle.parentElement.addEventListener("dragstart", handleDragStart);
  });

  const listItems = document.querySelectorAll(".activity-list-item");
  listItems.forEach((item) => {
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.index);
  e.target.classList.add("dragging"); // Optional: Add a class for styling the dragging item
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  const draggedIndex = e.dataTransfer.getData("text/plain");
  const targetIndex = Array.from(e.currentTarget.parentElement.children).indexOf(e.currentTarget);
  const activities = getActivities();

  // Move the dragged activity in the array
  const draggedItem = activities.splice(draggedIndex, 1)[0];
  activities.splice(targetIndex, 0, draggedItem);

  // Update the local storage and re-render the activities
  localStorage.setItem("activities", JSON.stringify(activities));
  renderActivities();
}

// Initialize the activities list and theme on page load
window.onload = function () {
  renderActivities();
  loadTheme();
};

function showTutorial() {
  document.getElementById("tutorialModal").style.display = "block";
  document.getElementById("popupOverlay").style.display = "block";
}

function closeTutorial() {
  document.getElementById("tutorialModal").style.display = "none";
  document.getElementById("popupOverlay").style.display = "none";
}

function exportActivities() {
  const activities = getActivities();
  const jsonString = JSON.stringify(activities, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'activities.json';
  a.click();

  URL.revokeObjectURL(url);
}

function importActivities(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
      try {
          const importedActivities = JSON.parse(event.target.result);
          if (Array.isArray(importedActivities)) {
              const activities = importedActivities;
              localStorage.setItem("activities", JSON.stringify(activities));
              renderActivities();
              alert("Activities imported successfully!");
          } else {
              alert("Invalid file format.");
          }
      } catch (e) {
          alert("Error reading file: " + e.message);
      }
  };

  reader.readAsText(file);
}

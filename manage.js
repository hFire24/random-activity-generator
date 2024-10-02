let currentEditIndex = null;
let currentAction = null;

function renderActivities() {
  const activities = getActivities();
  const activitiesContainer = document.getElementById("activitiesContainer");
  activitiesContainer.innerHTML = "";

  activities.forEach((activity, index) => {
    const activityDiv = document.createElement("div");
    activityDiv.className = "activity-list-item";
    if(activity.archived)
      activityDiv.innerHTML = `
            <span class="drag-handle">☰</span>
            <span class="task-name"><s>${activity.text}</s></span>
            <button class="green" onclick="openPopup(${index})">Edit</button>`;
    else
      activityDiv.innerHTML = `
            <span class="drag-handle">☰</span>
            <span class="task-name">${activity.text}</span>
            <button class="green" onclick="openPopup(${index})">Edit</button>`;
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
    document.getElementById("popupCategoryDropdown").value = "";
    document.getElementById("popupImportance").value = 1;
    document.getElementById("popupStandingTask").checked = false;
    document.getElementById("popupActiveTask").checked = false;
    document.getElementById("popupLongTask").checked = false;
    document.getElementById("popupMobileFriendlyTask").checked = false;
    showButtons("new");
  } else {
    document.getElementById("popupText").value = activity.text;
    document.getElementById("popupLink").value = activity.link || "";
    document.getElementById("popupImportance").value = activity.importance;
    document.getElementById("popupStandingTask").checked =
      activity.standingTask;
    document.getElementById("popupActiveTask").checked = activity.activeTask;
    document.getElementById("popupLongTask").checked = activity.longTask;
    document.getElementById("popupMobileFriendlyTask").checked =
      activity.mobileFriendlyTask;
    activity.archived ? showButtons("archive") : showButtons("active");
  }

  updateImportance("popupImportance", "importanceLabel");
  updateLabel("popupStandingTask", "standingLabel", "🦵", "🪑");
  updateLabel("popupActiveTask", "activeLabel", "🏃‍♂️", "😴");
  updateLabel("popupLongTask", "longLabel", "⏳", "⏱️");
  updateLabel("popupMobileFriendlyTask", "mobileLabel", "📱", "🏠");

  // Populate category dropdown
  const categories = getCategories();
  const categoryDropdown = document.getElementById('popupCategoryDropdown');
  categoryDropdown.innerHTML = ''; // Clear existing options

  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryDropdown.appendChild(option);
  });

  if (activity === undefined) {
    document.getElementById("popupText").value = "";
    categoryDropdown.value = 'None'; // None category
  } else {
    document.getElementById("popupText").value = activity.text;
    categoryDropdown.value = activity.category || 'None';
  }

  document.getElementById("popupOverlay").style.display = "block";
  document.getElementById("popupWindow").style.display = "block";
}

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
  document.getElementById("popupWindow").style.display = "none";
  currentEditIndex = null;
}

function showButtons(type) {
  switch(type) {
    case "new":
      document.getElementById("duplicateButton").style.display = "none";
      document.getElementById("archiveButton").style.display = "none";
      document.getElementById("unarchiveButton").style.display = "none";
      document.getElementById("deleteButton").style.display = "none";
      break;
    case "archive":
      document.getElementById("duplicateButton").style.display = "block";
      document.getElementById("archiveButton").style.display = "none";
      document.getElementById("unarchiveButton").style.display = "block";
      document.getElementById("deleteButton").style.display = "block";
      break;
    case "active":
      document.getElementById("duplicateButton").style.display = "block";
      document.getElementById("archiveButton").style.display = "block";
      document.getElementById("unarchiveButton").style.display = "none";
      document.getElementById("deleteButton").style.display = "block";
      break;
  }
}

function getCategories() {
  let categories = JSON.parse(localStorage.getItem('categories'));
  if (!categories) {
      categories = ['None']; // A default category if none exist
      localStorage.setItem('categories', JSON.stringify(categories));
  }
  return categories;
}

function saveCategories(categories) {
  localStorage.setItem('categories', JSON.stringify(categories));
}

function getWipes() {
  let wipes = JSON.parse(localStorage.getItem('wipes'));
  if(!wipes)
    return [];
  return wipes;
}

function openCategoryManager() {
  const categories = getCategories();
  const wipes = getWipes();
  const categoryList = document.getElementById('categoryList');
  categoryList.innerHTML = ''; // Clear existing list

  categories.forEach((category, index) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-item';

    const categoryName = document.createElement('span');
    categoryName.innerHTML = category;

    const categoryButton = document.createElement('button');
    categoryButton.className = "red";
    categoryButton.addEventListener('click', function () {
      if(confirm(`Are you sure you want to delete the ${category} category?`)) {
        let wipes = getWipes();
        wipes = wipes.filter(item => item !== category);
        localStorage.setItem("wipes",JSON.stringify(wipes));
        deleteCategory(index);
      }
    });
    categoryButton.innerHTML = "Delete";

    const lineBreak = document.createElement('br');

    const span = document.createElement('span');
    span.innerHTML = `Remove ${category} Tasks on Skip/Complete`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = wipes.includes(category);
    checkbox.addEventListener('change', function () { toggleCategoryWipe(category, checkbox.checked) });

    const hr = document.createElement('hr');

    categoryDiv.appendChild(categoryName);

    if(category !== "None") {
      categoryDiv.appendChild(categoryButton);
      categoryDiv.appendChild(lineBreak);
      categoryDiv.appendChild(span);
      categoryDiv.appendChild(checkbox);
    }

    categoryDiv.appendChild(hr);

    categoryList.appendChild(categoryDiv);
  });

  document.getElementById('categoryModal').style.display = 'block';
  document.getElementById('categoryOverlay').style.display = 'block';
}

function closeCategoryManager() {
  document.getElementById('categoryModal').style.display = 'none';
  document.getElementById('categoryOverlay').style.display = 'none';
}

function addCategory() {
  const newCategoryName = document.getElementById('newCategoryName').value;
  if (newCategoryName) {
    const categories = getCategories();
    if (!categories.includes(newCategoryName)) {
      categories.push(newCategoryName);
      saveCategories(categories);
      openCategoryManager(); // Refresh the category list
    } else {
      alert('Category already exists.');
    }
  }
}

function deleteCategory(index) {
  let categories = getCategories();
  const deletedCategory = categories[index];

  // Ensure that at least one category remains
  if (categories.length > 1) {
    // Remove the category from the list
    categories.splice(index, 1);
    saveCategories(categories);

    // Now update any activities that had the deleted category
    let activities = getActivities();
    activities = activities.map(activity => {
      if (activity.category === deletedCategory) {
        activity.category = "None"; // Switch category to "None"
      }
      return activity;
    });

    // Save updated activities to local storage
    localStorage.setItem("activities", JSON.stringify(activities));

    // Refresh the category list
    openCategoryManager();
  } else {
    alert('At least one category must remain.');
  }
}


function toggleCategoryWipe(category, isWiped) {
  let wipes = getWipes();
  if(!wipes)
    wipes = [];
  (isWiped && !wipes.includes(category)) ? wipes.push(category) : wipes = wipes.filter(item => item !== category);
  localStorage.setItem("wipes",JSON.stringify(wipes));
}

function saveChanges() {
  const activities = getActivities();

  if (currentEditIndex !== null) {
    activities[currentEditIndex] = {
      ...activities[currentEditIndex],
      text: document.getElementById("popupText").value,
      link: document.getElementById("popupLink").value || null,
      category: document.getElementById("popupCategoryDropdown").value || null,
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
      category: document.getElementById("popupCategoryDropdown").value || null,
      importance: parseInt(document.getElementById("popupImportance").value),
      standingTask: document.getElementById("popupStandingTask").checked,
      activeTask: document.getElementById("popupActiveTask").checked,
      longTask: document.getElementById("popupLongTask").checked,
      mobileFriendlyTask: document.getElementById("popupMobileFriendlyTask")
        .checked,
      timesCompleted: 0,
      timesSkipped: 0,
      dateCreated: new Date().toISOString(),
      archived: false,
    });
  }

  localStorage.setItem("activities", JSON.stringify(activities));
  closePopup();
  renderActivities();
}

function confirmArchive() {
  currentAction = { type: "archive", currentEditIndex };
  showConfirmationDialog("Are you sure you want to archive this task?");
}

function confirmDelete() {
  currentAction = { type: "delete", currentEditIndex };
  showConfirmationDialog("Are you sure you want to delete this task?");
}

function showConfirmationDialog(message) {
  document.getElementById("confirmationText").innerText = message;
  document.getElementById("confirmationDialog").style.display = "block";
  document.getElementById("confirmationOverlay").style.display = "block";
}

function confirmAction() {
  const activities = getActivities();

  if (currentAction.type === "archive") {
    activities[currentAction.currentEditIndex].archived = true;
  } else if (
    currentAction.type === "delete") {
    activities.splice(currentAction.currentEditIndex, 1);
  }

  localStorage.setItem("activities", JSON.stringify(activities));
  closeConfirmationDialog();
  closePopup();
  renderActivities();
}

function cancelAction() {
  closeConfirmationDialog();
}

function closeConfirmationDialog() {
  document.getElementById("confirmationDialog").style.display = "none";
  document.getElementById("confirmationOverlay").style.display = "none";
  currentAction = null;
}

function duplicateActivity() {
  const activities = getActivities();
  if(currentEditIndex !== null) {
    const activityToDuplicate = activities[currentEditIndex];
    const duplicatedActivity = {
      ...activityToDuplicate,
      text: activityToDuplicate.text + " copy",
      timesCompleted: 0,
      timesSkipped: 0,
      dateCreated: new Date().toISOString(),  // Optionally reset the creation date
    };
    let newEditIndex = currentEditIndex + 1;
    activities.splice(newEditIndex, 0, duplicatedActivity);
    // Create a new activity and insert
    localStorage.setItem("activities", JSON.stringify(activities));
    closePopup();
    renderActivities();
    openPopup(newEditIndex);
  }
}

function unarchiveActivity() {
  const activities = getActivities();
  activities[currentEditIndex].archived = false;
  localStorage.setItem("activities", JSON.stringify(activities));
  closePopup();
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

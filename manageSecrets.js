// Load secretArray from localStorage or initialize an empty array
let secretArray = getSecretArray();

// Display secrets in the textarea on page load
function displaySecretsInTextarea() {
  const secretTextarea = document.getElementById('secretTextarea');
  secretTextarea.value = secretArray.join('\n');  // Join secrets with line breaks
}

// Add event listener for adding new secrets
document.getElementById('addSecretBtn').addEventListener('click', () => {
  const newSecret = document.getElementById('newSecret').value;
  if (newSecret) {
    addSecret(newSecret);
    document.getElementById('newSecret').value = '';  // Clear the input
    displaySecretsInTextarea();  // Refresh the textarea
  }
});

// Add event listener for saving changes made to the textarea
document.getElementById('saveSecretsBtn').addEventListener('click', () => {
  const updatedSecrets = document.getElementById('secretTextarea').value.split('\n');  // Split the textarea value by line breaks
  saveSecrets(updatedSecrets);  // Save the updated secrets array to localStorage
  alert('Secrets saved!');
});

// Function to add a secret to the array and store it in localStorage
function addSecret(secret) {
  secretArray.push(secret);
  localStorage.setItem('secretArray', JSON.stringify(secretArray));
}

// Function to save the updated secret array to localStorage
function saveSecrets(updatedSecrets) {
  secretArray = updatedSecrets.filter(secret => secret.trim() !== "");  // Remove empty lines
  localStorage.setItem('secretArray', JSON.stringify(secretArray));
}

// Function to get the array from localStorage
function getSecretArray() {
  return JSON.parse(localStorage.getItem('secretArray')) || [];
}

// Initial display of secrets when the page loads
displaySecretsInTextarea();

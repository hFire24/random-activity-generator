import { initSync, getSecrets, saveSecrets } from './sync.js';

// Load secretArray from cloud (or localStorage only in offline mode)
let secretArray = [];

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
document.getElementById('saveSecretsBtn').addEventListener('click', async () => {
  const updatedSecrets = document.getElementById('secretTextarea').value.split('\n');  // Split the textarea value by line breaks
  secretArray = updatedSecrets.filter(secret => secret.trim() !== "");
  await saveSecrets(secretArray);  // Save the updated secrets array to cloud
  alert('Secrets saved!');
});

// Function to add a secret to the array and store it in cloud
async function addSecret(secret) {
  secretArray.push(secret);
  await saveSecrets(secretArray);
}

// Initial display of secrets when the page loads
async function initSecrets() {
  await initSync();
  secretArray = getSecrets();
  displaySecretsInTextarea();
}

initSecrets();

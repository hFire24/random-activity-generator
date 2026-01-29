import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSecrets, saveSecrets, initSync } from "../../sync.js";

const Secrets = () => {
  const [secrets, setSecrets] = useState([]);
  const [newSecret, setNewSecret] = useState("");
  const [secretsText, setSecretsText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      await initSync(); // Initialize sync service and wait for it
      const loadedSecrets = getSecrets();
      setSecrets(loadedSecrets);
      setSecretsText(loadedSecrets.join('\n'));
    };
    init();
  }, []);

  const handleAddSecret = async () => {
    if (newSecret.trim()) {
      const updatedSecrets = [...secrets, newSecret];
      setSecrets(updatedSecrets);
      setSecretsText(updatedSecrets.join('\n'));
      await saveSecrets(updatedSecrets);
      setNewSecret("");
    }
  };

  const handleSaveSecrets = async () => {
    const updatedSecrets = secretsText
      .split('\n')
      .filter(secret => secret.trim() !== "");
    setSecrets(updatedSecrets);
    await saveSecrets(updatedSecrets);
    alert("Secrets saved!");
  };

  return (
    <div>
      <h1>Manage Secrets</h1>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
            placeholder="Enter a new secret"
            style={{ width: '70%', marginRight: '10px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSecret()}
          />
          <button onClick={handleAddSecret} className="green">Add Secret</button>
        </div>

        <h2>Your Secrets</h2>
        <textarea
          value={secretsText}
          onChange={(e) => setSecretsText(e.target.value)}
          rows="10"
          style={{ width: '100%', padding: '10px' }}
        />

        <div id="buttonsReactContainer">
          <button onClick={handleSaveSecrets} className="green">Save</button>
          <button onClick={() => navigate("/manage")} className="blue">Back to Manage</button>
        </div>
      </div>
    </div>
  );
};

export default Secrets;

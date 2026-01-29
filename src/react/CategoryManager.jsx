import React, { useState, useEffect } from "react";
import { getCategories, saveCategories, getWipes, saveWipes } from "../../sync.js";
import { sanitizeInput } from "./utils.js";

const CategoryManager = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [wipes, setWipes] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    setCategories(getCategories());
    setWipes(getWipes());
  }, []);

  const handleAddCategory = async () => {
    const sanitizedCategory = sanitizeInput(newCategory.trim());
    if (!sanitizedCategory) {
      alert("Category name cannot be empty!");
      return;
    }
    if (categories.includes(sanitizedCategory)) {
      alert("Category already exists!");
      return;
    }
    const updatedCategories = [...categories, sanitizedCategory];
    await saveCategories(updatedCategories);
    setCategories(updatedCategories);
    setNewCategory("");
  };

  const handleDeleteCategory = async (categoryToDelete) => {
    if (categoryToDelete === "None") {
      alert("Cannot delete the 'None' category!");
      return;
    }
    if (window.confirm(`Are you sure you want to delete the category "${categoryToDelete}"?`)) {
      const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
      const updatedWipes = wipes.filter(cat => cat !== categoryToDelete);
      await saveCategories(updatedCategories);
      await saveWipes(updatedWipes);
      setCategories(updatedCategories);
      setWipes(updatedWipes);
    }
  };

  const handleToggleWipe = async (category) => {
    let updatedWipes;
    if (wipes.includes(category)) {
      updatedWipes = wipes.filter(cat => cat !== category);
    } else {
      updatedWipes = [...wipes, category];
    }
    await saveWipes(updatedWipes);
    setWipes(updatedWipes);
  };

  return (
    <div id="popupOverlay" className="popup-overlay-react">
      <div id="popupWindow" className="popup-window-react">
        <h2>Manage Categories</h2>
        
        <div className="row">
          <label htmlFor="newCategory">New Category</label>
          <input 
            id="newCategory" 
            type="text" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button onClick={handleAddCategory} className="green">Add</button>
        </div>

        <div className="category-list">
          {categories.map((cat) => (
            <div key={cat} className="category-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ flex: 1 }}>{cat}</span>
              {cat !== "None" && (
                <>
                  <label style={{ marginRight: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={wipes.includes(cat)} 
                      onChange={() => handleToggleWipe(cat)}
                    />
                    {" "}Wipe on Complete
                  </label>
                  <button onClick={() => handleDeleteCategory(cat)} className="red" style={{ padding: '5px 10px' }}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="save-exit-group">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
import React, {useState, useEffect} from "react";

const TaskEditor = ({ task, onSave, onClose }) => {
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [importance, setImportance] = useState(1);
  const [category, setCategory] = useState("None");
  const [standingTask, setStandingTask] = useState(false);
  const [activeTask, setActiveTask] = useState(false);
  const [longTask, setLongTask] = useState(false);
  const [mobileFriendly, setMobileFriendly] = useState(false);

  // Load task data when a task is passed in
  useEffect(() => {
    if (task) {
      setText(task.text || "");
      setLink(task.link || "");
      setImportance(task.importance || 1);
      setCategory(task.category || "None");
      setStandingTask(task.standingTask || false);
      setActiveTask(task.activeTask || false);
      setLongTask(task.longTask || false);
      setMobileFriendly(task.mobileFriendlyTask || false);
    }
  }, [task]);

  // Handle form submission
  const handleSave = () => {
    const updatedTask = {
      text,
      link,
      importance,
      category,
      standingTask,
      activeTask,
      longTask,
      mobileFriendlyTask: mobileFriendly,
    };

    onSave(updatedTask);
    onClose();
  };

  const requiredAst = <span style={{color: "red", fontWeight:"inherit"}}>*</span>;

  return (
    <div id="popupOverlay" className="popup-overlay-react">
      <div id="popupWindow" className="popup-window-react">
        <h2>{task && task.text ? "Edit Task" : "Add Task"}</h2>
        
        <div className="row">
          <label htmlFor="text">Text{requiredAst}</label>
          <input id="text" type="text" value={text} onChange={(e) => setText(e.target.value)} />
        </div>

        <div className="row">
          <label htmlFor="link">Link</label>
          <input id="link" type="text" value={link} onChange={(e) => setLink(e.target.value)} />
        </div>

        <div className="row">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="None">None</option>
            <option value="Meditation">Meditation</option>
            <option value="Music">Music</option>
            <option value="Food">Food</option>
            <option value="Exercise">Exercise</option>
            <option value="Gaming">Gaming</option>
          </select>
        </div>

        <div className="row">
          <label htmlFor="importance">Importance ({importance})</label>
          <input id="importance" className="importance-slider" type="range" min="1" max="4" value={importance} onChange={(e) => setImportance(e.target.value)} />
        </div>

        <div className="toggle-container">
          <div className="toggle-row">
            <span className="emoji-label" id="standingLabel">{standingTask ? "🦵" : "🪑"}</span>
            <label className="toggle-switch">
              <input id="standingTask" type="checkbox" checked={standingTask} onChange={() => setStandingTask(!standingTask)} />
              <span className="slider"></span>
            </label>
            <span className="toggle-text">{standingTask ? "Standing Task" : "Sitting Task"}</span>
          </div>
          <div className="toggle-row">
            <span className="emoji-label" id="activeLabel">{activeTask ? "🏃‍♂️" : "😴"}</span>
            <label className="toggle-switch">
              <input id="activeTask" type="checkbox" checked={activeTask} onChange={() => setActiveTask(!activeTask)} />
              <span className="slider"></span>
            </label>
            <span className="toggle-text">{activeTask ? "Active Task" : "Lazy Task"}</span>
          </div>
          <div className="toggle-row">
            <span className="emoji-label" id="longLabel">{longTask ? "⏳" : "⏱️"}</span>
            <label className="toggle-switch">
              <input id="longTask" type="checkbox" checked={longTask} onChange={() => setLongTask(!longTask)} />
              <span className="slider"></span>
            </label>
            <span className="toggle-text">{longTask ? "Long Task" : "Short Task"}</span>
          </div>
          <div className="toggle-row">
            <span className="emoji-label" id="mobileLabel">{mobileFriendly ? "📱" : "🏠"}</span>
            <label className="toggle-switch">
              <input id="mobileFriendlyTask" type="checkbox" checked={mobileFriendly} onChange={() => setMobileFriendly(!mobileFriendly)} />
              <span className="slider"></span>
            </label>
            <span className="toggle-text">{mobileFriendly ? "Mobile-Friendly Task" : "Home Task"}</span>
          </div>
        </div>

        <div className="save-exit-group">
          <button className="green" onClick={handleSave}>Save</button>
          <button className="red" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditor;
import React from "react";

const TaskItem = ({ task, onEdit }) => {
  const renderTaskText = (text) => {
    return text.replace(/<br\s*\/?>/gi, "\n");
  };

  return (
    <div className="activity-list-item">
      <span className="drag-handle">☰</span>
      <span
        className="task-name"
        style={{ 
          textDecoration: task.archived ? "line-through" : "none",
          whiteSpace: "pre-wrap" // Preserve whitespace and line breaks
        }}
      >
        {renderTaskText(task.text)}
      </span>
      <button className="green" onClick={onEdit}>Edit</button>
    </div>
  );
};

export default TaskItem;

import React from "react";

const TaskItem = ({ task, onEdit, onDragStart, onDragOver, onDrop, index }) => {
  const renderTaskText = (text) => {
    return text.replace(/<br\s*\/?>/gi, "\n");
  };

  return (
    <div 
      className="activity-list-item"
      draggable="true"
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={(e) => onDrop(e, index)}
    >
      <span className="drag-handle" style={{ cursor: 'grab' }}>☰</span>
      <span
        className="task-name"
        style={{ 
          textDecoration: task.archived ? "line-through" : "none",
          whiteSpace: "pre-wrap"
        }}
      >
        {renderTaskText(task.text)}
      </span>
      <button className="green" onClick={onEdit}>Edit</button>
    </div>
  );
};

export default TaskItem;

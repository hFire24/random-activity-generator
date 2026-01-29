import React from "react";

const Task = (props) => {
  const { link, onClick } = props;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (link) {
      window.open(link, "_blank");
    }
  };
  
  const renderText = (text) => {
    if (typeof text === 'string') {
      return text.replace(/<br\s*\/?>/gi, "\n");
    }
    return text;
  };
  
  const style = {
    ...props.style,
    cursor: (link || onClick) ? "pointer" : "default",
    textDecoration: (link || onClick) ? "underline" : "none",
    whiteSpace: "pre-wrap"
  };
  
  return (
    <h1 style={style} onClick={handleClick}>{renderText(props.children)}</h1>
  )
};

export default Task;
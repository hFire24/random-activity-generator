import React from "react";
import { useNavigate } from "react-router-dom";

const SelectScreen = ({ onFilterSelect }) => {
  const navigate = useNavigate();

  function applyFilter(filter) {
    onFilterSelect(filter);
    navigate("/activity");
  }

  return (
    <>
      <h1>Random Activity Generator</h1>
      <p>Select how you want to filter your activities:</p>
      <div id="filters">
        <button className="gold" onClick={() => applyFilter('default')}>No Filter</button>
        <button className="hotpink" onClick={() => applyFilter('short')}>Short Only</button>
        <button className="skyblue" onClick={() => applyFilter('lazy')}>Lazy Only</button>
        <button className="limegreen" onClick={() => applyFilter('lowPriority')}>Low-Priority</button>
        <button className="red2" onClick={() => applyFilter('highPriority')}>High-Priority</button>
        <button className="purple" onClick={() => applyFilter('mobile')}>Mobile-Friendly</button>
      </div>
      <button className="blue" onClick={() => navigate("/manage")}>Manage Tasks</button>
      <br />
    </>
  )
};

export default SelectScreen;
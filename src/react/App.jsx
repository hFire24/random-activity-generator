import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SelectScreen from "./SelectScreen";
import ManagePage from "./ManagePage";
import Secrets from "./ManageSecrets";
import Activity from "./Activity";
import ThemeSelector from "./ThemeSelector";

function App() {
  const [filter, setFilter] = useState("default");

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SelectScreen onFilterSelect={setFilter} />} />
          <Route path="manage" element={<ManagePage />} />
          <Route path="secrets" element={<Secrets />} />
          <Route path="activity" element={<Activity filter={filter} />} />
        </Routes>
      </BrowserRouter>
      <ThemeSelector />
    </>
  );
}

export default App;

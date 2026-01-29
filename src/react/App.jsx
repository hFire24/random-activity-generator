import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SelectScreen from "./SelectScreen";
import ManagePage from "./ManagePage";
import Secrets from "./ManageSecrets";
import Activity from "./Activity";
import Login from "./Login";
import ThemeSelector from "./ThemeSelector";
import Footer from "./Footer";
import TermsOfUse from "./TermsOfUse";
import PrivacyPolicy from "./PrivacyPolicy";
import HomeButton from "./HomeButton";

function App() {
  const [filter, setFilter] = useState("default");

  return (
    <>
      <BrowserRouter basename="/random-activity-generator">
        <HomeButton />
        <div className="app-container">
          <div className="app-content">
            <Routes>
              <Route path="/" element={<SelectScreen onFilterSelect={setFilter} />} />
              <Route path="login" element={<Login />} />
              <Route path="manage" element={<ManagePage />} />
              <Route path="secrets" element={<Secrets />} />
              <Route path="activity" element={<Activity filter={filter} />} />
              <Route path="terms" element={<TermsOfUse />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
            </Routes>
            <ThemeSelector />
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;

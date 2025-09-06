import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DealsList from "./DealsList001";
import DealsDashboard from "./Owners/DealsDashboard";
import TermsConditions from "./TermsConditions/TermsConditions";
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicy";
import DealsDashboard1 from "./Owners/DealsDashboard1";
import DealsList2 from "./DealsList2";
import DealStatus from "./Owners/DealStatus";

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-success sticky-top">
          <div className="container">
            <Link className="navbar-brand fw-bold text-light" to="/">
              Deals In My City!
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link text-light" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-light" href="#About">
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-light" href="#Contact">
                    Contact
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-light" href="/dashboard">
                    Upload Deal
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<DealsList2 />} />
            <Route path="/deals" element={<DealsList />} />
            <Route path="/dashboard" element={<DealsDashboard1 />} />
            <Route path="/deal_status" element={<DealStatus />} />
            <Route path="/categories" element={<h2>Categories Page</h2>} />
            <Route path="/about" element={<h2>About Page</h2>} />
            <Route path="/contact" element={<h2>Contact Page</h2>} />
            <Route path="/TermsConditions" element={<TermsConditions />} />
            <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
          </Routes>
        </main>

        {/* Footer */}
       <footer className="bg-success text-white py-4 mt-auto">
  <div className="container">
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-center text-md-start">
      
      {/* Left: copyright */}
      <p className="mb-2 mb-md-0">
        &copy; 2025 Deals In My City. All rights reserved.
      </p>

      {/* Middle: links */}
      <div className="d-flex justify-content-center mb-2 mb-md-0">
        <Link className="nav-link text-white px-2" to="/TermsConditions">
          Terms & Conditions
        </Link>
        <Link className="nav-link text-white px-2" to="/PrivacyPolicy">
          Privacy Policy
        </Link>
      </div>

      {/* Right: icons */}
      <div className="d-flex justify-content-center">
        <a href="#" className="text-white me-3">
          <i className="bi bi-facebook"></i>
        </a>
        <a href="#" className="text-white me-3">
          <i className="bi bi-twitter"></i>
        </a>
        <a href="#" className="text-white">
          <i className="bi bi-instagram"></i>
        </a>
      </div>

    </div>
  </div>
</footer>

      </div>
    </Router>
  );
}


export default App;

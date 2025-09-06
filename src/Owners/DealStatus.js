import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";

const DealStatus = () => {
  const [pendingDeals, setPendingDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Fetch pending deals
  const fetchPendingDeals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "deals1"),
        where("status", "==", 0),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const deals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingDeals(deals);
    } catch (err) {
      console.error("Error fetching pending deals:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingDeals();
    }
  }, [isAuthenticated]);

  // Approve or Reject
  const updateStatus = async (dealId, newStatus) => {
    try {
      await updateDoc(doc(db, "deals1", dealId), { status: newStatus });
      setPendingDeals((prev) => prev.filter((deal) => deal.id !== dealId));
    } catch (err) {
      console.error("Failed to update deal status:", err);
    }
  };

  // Login check
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "smitadmin" && password === "smitadmin1") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <h3 className="mb-3">🔐 Admin Login</h3>
        <form onSubmit={handleLogin} className="border p-4 rounded shadow-sm bg-light" style={{ maxWidth: "400px" }}>
          <div className="mb-3">
            <label className="form-label">Username:</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {loginError && <div className="text-danger mb-3">{loginError}</div>}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    );
  }

  // Authenticated UI
  return (
    <div className="container py-4">
      <h3 className="mb-3">🕵️ Pending Deals for Review</h3>

      {loading ? (
        <p>Loading pending deals...</p>
      ) : pendingDeals.length === 0 ? (
        <p className="text-muted">No pending deals found.</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pendingDeals.map((deal) => (
            <div key={deal.id} className="border rounded shadow-sm p-3 bg-white">
              <p><strong>Deal ID:</strong> {deal.id}</p>
              <p><strong>Offer Code:</strong> {deal.offer_code}</p>
              <p><strong>Uploader Email:</strong> {deal.uploaderEmail || "N/A"}</p>
              <p><strong>Description:</strong> {deal.description}</p>
              <p><strong>Category:</strong> {deal.category_name}</p>
              <p><strong>City:</strong> {deal.city_name}</p>
              <p><strong>Status:</strong> {deal.status}</p>
              <p><strong>Start Date:</strong> {deal.start_date}</p>
              <p><strong>End Date:</strong> {deal.end_date}</p>
              <p><strong>Created At:</strong> {deal.createdAt?.toDate?.().toLocaleString() || "N/A"}</p>

              {deal.instagram_url && (
                <p>
                  <strong>Instagram:</strong>{" "}
                  <a href={deal.instagram_url} target="_blank" rel="noreferrer">
                    {deal.instagram_url}
                  </a>
                </p>
              )}

              {deal.location && (
                <>
                  <p><strong>Branch Name:</strong> {deal.location.branch_name}</p>
                  <p><strong>Chain Name:</strong> {deal.location.chain_name}</p>
                  <p><strong>Address:</strong> {deal.location.address}</p>
                  <p><strong>Phone:</strong> {deal.location.phone}</p>
                </>
              )}

              <div className="d-flex gap-2 flex-wrap mt-3">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => updateStatus(deal.id, 1)}
                >
                  ✅ Approve
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => updateStatus(deal.id, -1)}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DealStatus;

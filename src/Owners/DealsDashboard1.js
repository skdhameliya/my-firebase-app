import React, { useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap";
import citiesData from "../data/cities.json";
import categoriesData from "../data/categories.json";

const DealsDashboard = () => {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);

  const [showUploaderModal, setShowUploaderModal] = useState(false);
  const [uploaderInfo, setUploaderInfo] = useState({
    city_name: "",
    address: "",
    branch_name: "",
    chain_name: "",
    phone: "",
  });

  const [formData, setFormData] = useState({
    id: null,
    category_name: "",
    city_name: "",
    description: "",
    start_date: "",
    end_date: "",
    offer_code: "",
    instagram_url: "",
    location: {
      address: "",
      branch_name: "",
      chain_name: "",
      phone: "",
    },
  });

  const cityOptions = citiesData
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.name, label: `${c.name}, ${c.province}` }));

  const categoryOptions = categoriesData
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.name, label: c.name }));

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "uploaders", cred.user.email), {
        email: email,
        createdAt: serverTimestamp(),
      });
      setUser(cred.user);
      setError("");
      setShowUploaderModal(true);
    } catch (err) {
      // console.error("Signup error:", err);
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser(cred.user);
      setError("");
      await fetchUploaderInfo(cred.user.email);
      fetchDeals(cred.user.email);
    } catch (err) {
      // console.error("Login error:", err);
      setError("Invalid email or password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setDeals([]);
  };

  const fetchDeals = async (uploaderEmail) => {
    if (!uploaderEmail) return;
    setLoadingDeals(true);
    try {
      const q = query(
        collection(db, "deals1"),
        where("uploaderEmail", "==", uploaderEmail)
      );
      const snapshot = await getDocs(q);
      const allDeals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeals(allDeals);
    } catch (err) {
      // console.error("Error fetching deals:", err);
    }
    setLoadingDeals(false);
  };

  const fetchUploaderInfo = async (email) => {
    try {
      const docRef = doc(db, "uploaders", email);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        setShowUploaderModal(true);
        return;
      }

      const data = snap.data();
      const { city_name, address, branch_name, chain_name, phone } = data;

      if (!city_name || !address || !branch_name || !chain_name || !phone) {
        setShowUploaderModal(true);
        return;
      }

      setUploaderInfo({ city_name, address, branch_name, chain_name, phone });

      setFormData((prev) => ({
        ...prev,
        city_name,
        location: { address, branch_name, chain_name, phone },
      }));
    } catch (err) {
      // console.error("Uploader fetch error:", err);
    }
  };

  const handleUploaderChange = (e) => {
    const { name, value } = e.target;
    setUploaderInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUploaderInfo = async () => {
    const { city_name, address, branch_name, chain_name, phone } = uploaderInfo;

    if (!city_name || !address || !branch_name || !chain_name || !phone) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await setDoc(doc(db, "uploaders", user.email), {
        email: user.email,
        city_name,
        address,
        branch_name,
        chain_name,
        phone,
        updatedAt: serverTimestamp(),
      });

      setFormData((prev) => ({
        ...prev,
        city_name,
        location: { address, branch_name, chain_name, phone },
      }));

      setShowUploaderModal(false);
    } catch (err) {
      // console.error("Failed to save uploader info:", err);
      alert("Error saving uploader info.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["address", "branch_name", "chain_name", "phone"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateDoc(doc(db, "deals1", formData.id), { ...formData });
        alert("Deal updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "deals1"), {
          ...formData,
          createdAt: serverTimestamp(),
          uploaderEmail: user.email,
          status: 0,
        });
        await updateDoc(docRef, { id: docRef.id });
        alert("✅ Deal submitted successfully! It will be visible after approval.");
      }
      fetchDeals(user.email);
      // handleReset();
    } catch (err) {
      // console.error(err);
      alert("Error saving deal");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await deleteDoc(doc(db, "deals1", id));
        fetchDeals(user.email);
      } catch (err) {
        // console.error(err);
        alert("Failed to delete deal");
      }
    }
  };

  const handleEdit = (deal) => {
    setFormData({ ...deal });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setFormData({
      id: null,
      category_name: "",
      city_name: "",
      description: "",
      start_date: "",
      end_date: "",
      offer_code: "",
      instagram_url: "",
      location: { address: "", branch_name: "", chain_name: "", phone: "" },
    });
  };

  if (!user) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light px-3">
        <div className="card shadow p-4 w-100" style={{ maxWidth: "400px" }}>
          <h3 className="text-center mb-4">
            {isSignup ? "Sign Up" : "Login"}
          </h3>
          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control mb-3"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control mb-3"
              required
            />
            {error && <div className="text-danger mb-2">{error}</div>}
            <button type="submit" className="btn btn-success w-100">
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>
          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup
                ? "Already have an account? Login"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="m-0">Deals Dashboard</h2>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Logged in as: {user.email}</span>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row g-3">
          <div className="col-md-6">
            <Select
              options={categoryOptions}
              placeholder="Select Category"
              value={
                formData.category_name
                  ? { value: formData.category_name, label: formData.category_name }
                  : null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  category_name: selected?.value || "",
                }))
              }
            />
          </div>
          <div className="col-md-6">
            <Select
              options={cityOptions}
              placeholder="Select City"
              value={
                formData.city_name
                  ? { value: formData.city_name, label: formData.city_name }
                  : null
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  city_name: selected?.value || "",
                }))
              }
            />
          </div>

          {["offer_code", "description", "instagram_url"].map((field) => (
            <div className="col-md-6" key={field}>
              <input
                type="text"
                name={field}
                placeholder={field.replace("_", " ").toUpperCase()}
                className="form-control"
                value={formData[field]}
                onChange={handleChange}
              />
            </div>
          ))}

          <div className="col-md-6">
            <input
              type="date"
              name="start_date"
              className="form-control"
              value={formData.start_date}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <input
              type="date"
              name="end_date"
              className="form-control"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>

          {["address", "branch_name", "chain_name", "phone"].map((name) => (
            <div className="col-md-6" key={name}>
              <input
                type="text"
                name={name}
                placeholder={name.replace("_", " ").toUpperCase()}
                className="form-control"
                value={formData.location[name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 d-flex gap-2 flex-wrap">
          <button type="submit" className="btn btn-success">
            {formData.id ? "Update Deal" : "Add Deal"}
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>

      <h4>My Deals</h4>
      <p className="text-muted mb-3">
        📌 Note: Submitted deals are reviewed before becoming publicly visible.
      </p>

      {loadingDeals ? (
        <p>Loading deals...</p>
      ) : deals.length === 0 ? (
        <p>No deals found.</p>
      ) : (
        <div className="list-group">
          {deals.map((deal) => (
            <div key={deal.id} className="list-group-item mb-3 p-3 shadow-sm rounded">
              <h5>{deal.offer_code}</h5>
              <p>{deal.description}</p>
              <p>Start: {deal.start_date} | End: {deal.end_date}</p>
              {deal.instagram_url && (
                <p>
                  Instagram:{" "}
                  <a href={deal.instagram_url} target="_blank" rel="noreferrer">
                    {deal.instagram_url}
                  </a>
                </p>
              )}
              {deal.location && (
                <>
                  <p>📍 {deal.location.address}</p>
                  <p>🏬 {deal.location.branch_name}</p>
                  <p>🏢 {deal.location.chain_name}</p>
                  <p>📞 {deal.location.phone}</p>
                </>
              )}
              <div className="mt-2 d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={() => handleEdit(deal)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(deal.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for uploader info */}
      <Modal show={showUploaderModal} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Complete Your Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label>City</label>
            <Select
              options={cityOptions}
              value={
                uploaderInfo.city_name
                  ? { value: uploaderInfo.city_name, label: uploaderInfo.city_name }
                  : null
              }
              onChange={(selected) =>
                setUploaderInfo((prev) => ({
                  ...prev,
                  city_name: selected?.value || "",
                }))
              }
            />
          </div>
          {["address", "branch_name", "chain_name", "phone"].map((name) => (
            <input
              key={name}
              type="text"
              name={name}
              placeholder={name.replace("_", " ").toUpperCase()}
              className="form-control mb-2"
              value={uploaderInfo[name]}
              onChange={handleUploaderChange}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSaveUploaderInfo}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DealsDashboard;

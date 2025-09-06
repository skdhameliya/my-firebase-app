// DealsDashboard.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function DealsDashboard() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    offer_code: "",
    category_id: "",
    location_id: "",
    start_date: "",
    end_date: "",
  });
  const [editingDealId, setEditingDealId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  // Fetch locations and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const locSnap = await getDocs(collection(db, "locations"));
        setLocations(locSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching locations or categories:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch deals for selected location
  const fetchDeals = async (locId) => {
    setLoading(true);
    try {
      const dealSnap = await getDocs(
        query(collection(db, "deals"), where("location_id", "==", locId))
      );

      const locData = locations.find((l) => l.id === locId);

      const dealData = dealSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        location: locData || null,
      }));

      setDeals(dealData);
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
    setLoading(false);
  };

  const handleLocationChange = (e) => {
    const locId = e.target.value;
    setSelectedLocationId(locId);
    setFormData({ ...formData, location_id: locId });
    if (locId) fetchDeals(locId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location_id || !formData.category_id) {
      return alert("Please select location and category");
    }

    try {
      if (editingDealId) {
        // Update existing deal
        const dealRef = doc(db, "deals", editingDealId);
        await updateDoc(dealRef, formData);
        setEditingDealId(null);
      } else {
        // Add new deal
        await addDoc(collection(db, "deals"), formData);
      }

      // Reset form but keep selected location
      setFormData({
        description: "",
        offer_code: "",
        category_id: "",
        location_id: selectedLocationId,
        start_date: "",
        end_date: "",
      });

      fetchDeals(selectedLocationId);
    } catch (error) {
      console.error("Error saving deal:", error);
    }
  };

  const handleEdit = (deal) => {
    setEditingDealId(deal.id);
    setFormData({
      description: deal.description,
      offer_code: deal.offer_code,
      category_id: deal.category_id,
      location_id: deal.location_id,
      start_date: deal.start_date,
      end_date: deal.end_date,
    });
  };

  const handleDelete = async (dealId) => {
    if (!window.confirm("Are you sure to delete this deal?")) return;
    try {
      const dealRef = doc(db, "deals", dealId);
      await deleteDoc(dealRef);
      fetchDeals(selectedLocationId);
    } catch (error) {
      console.error("Error deleting deal:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Deals Dashboard</h2>

      {/* Select Location */}
      <div className="mb-4 w-50 mx-auto">
        <label className="form-label">Select Location</label>
        <select
          className="form-select"
          value={selectedLocationId}
          onChange={handleLocationChange}
        >
          <option value="">-- Select a location --</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.chain_name} - {loc.branch_name}
            </option>
          ))}
        </select>
      </div>

      {/* Add / Edit Deal Form */}
      {selectedLocationId && (
        <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded shadow-sm">
          <h5>{editingDealId ? "Edit Deal" : "Add Deal"}</h5>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              className="form-control"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Offer Code</label>
            <input
              className="form-control"
              value={formData.offer_code}
              onChange={(e) =>
                setFormData({ ...formData, offer_code: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
            >
              <option value="">-- Select category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              required
            />
          </div>

          <button className="btn btn-primary" type="submit">
            {editingDealId ? "Update Deal" : "Add Deal"}
          </button>
          {editingDealId && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => {
                setEditingDealId(null);
                setFormData({
                  description: "",
                  offer_code: "",
                  category_id: "",
                  location_id: selectedLocationId,
                  start_date: "",
                  end_date: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      )}

      {/* Deals List */}
      {loading ? (
        <p>Loading deals...</p>
      ) : deals.length === 0 ? (
        selectedLocationId && <p>No deals found for this location.</p>
      ) : (
        <div className="row g-3">
          {deals.map((deal) => (
            <div key={deal.id} className="col-6 col-lg-4 d-flex">
              <div className="card h-100 shadow-sm flex-fill">
                <div className="card-body">
                  <h5 className="card-title">{deal.description}</h5>
                  <ul className="list-unstyled mb-2">
                    <li>
                      <strong>Offer Code:</strong> {deal.offer_code}
                    </li>
                    <li>
                      <strong>Category:</strong>{" "}
                      {categories.find((c) => c.id === deal.category_id)?.name ||
                        deal.category_id}
                    </li>
                  </ul>

                  {deal.location && (
                    <div className="mb-2">
                      <p className="mb-1">
                        <strong>Chain:</strong> {deal.location.chain_name}
                      </p>
                      <p className="mb-1">
                        <strong>Branch:</strong> {deal.location.branch_name}
                      </p>
                      <p className="mb-1">
                        <strong>Address:</strong> {deal.location.address}
                      </p>
                      <p className="mb-0">
                        <strong>Phone:</strong> {deal.location.phone || "N/A"}
                      </p>
                    </div>
                  )}

                  <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                    <strong>Valid:</strong> {deal.start_date} → {deal.end_date}
                  </p>

                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(deal)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(deal.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

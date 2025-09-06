// DealsPage.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

export default function DealsPage() {
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [deals, setDeals] = useState([]);
  const [cityInput, setCityInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch cities, categories, and locations on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [citiesSnap, categoriesSnap, locationsSnap] = await Promise.all([
          getDocs(collection(db, "cities")),
          getDocs(collection(db, "categories")),
          getDocs(collection(db, "locations")),
        ]);

        setCities(citiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setCategories(
          categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setLocations(
          locationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Build Firestore query based on filters
  const buildQuery = (reset = false) => {
    let q = collection(db, "deals");
    const filters = [];

    if (cityInput) filters.push(where("city_id", "==", cityInput));
    if (categoryInput) filters.push(where("category_id", "==", categoryInput));

    if (reset) {
      setLastVisible(null);
      setHasMore(true);
    }

    if (lastVisible && !reset) {
      q = query(q, ...filters, orderBy("start_date"), startAfter(lastVisible), limit(20));
    } else if (filters.length > 0) {
      q = query(q, ...filters, orderBy("start_date"), limit(20));
    } else {
      q = query(q, orderBy("start_date"), limit(20));
    }

    return q;
  };

  // Fetch deals based on selected filters
  const fetchDeals = async (reset = false) => {
    if (!cityInput && !categoryInput && !reset) return;
    setLoading(true);
    try {
      if (reset) setDeals([]);

      const q = buildQuery(reset);
      const snapshot = await getDocs(q);

      const dealsData = snapshot.docs.map((doc) => {
        const deal = doc.data();
        const location = locations.find((loc) => loc.id === deal.location_id) || {};
        const categoryName = categories.find((c) => c.id === deal.category_id)?.name || "";
        const cityName = cities.find((c) => c.id === deal.city_id)?.name || "";

        return { id: doc.id, ...deal, location, category: categoryName, city: cityName };
      });

      setDeals((prev) => (reset ? dealsData : [...prev, ...dealsData]));

      if (snapshot.docs.length < 20) {
        setHasMore(false);
      } else {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
    setLoading(false);
  };

  // Reset deals when filters change
  useEffect(() => {
    fetchDeals(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityInput, categoryInput]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <section className="bg-success text-white py-5 rounded-bottom-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Find the Best Deals in Your City!</h1>
          <p className="lead mb-4">
            Save money, discover offers, and never miss a discount near you.
          </p>

          <div className="row g-2 justify-content-center px-5">
            <div className="col-md-4">
              <select
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="form-select border-dark border-2"
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="form-select border-dark border-2"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Cards */}
      <div className="container py-5">
        {deals.length === 0 && !loading && (
          <p className="text-center text-muted">No deals found for selected filters.</p>
        )}

        <div className="row g-3">
          {deals.map((deal) => (
            <div key={deal.id} className="col-12 col-lg-4 d-flex">
              <div className="card flex-fill shadow-sm border border-secondary">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold">{deal.description}</h5>

                  <div className="mt-auto">
                    <p>
                      <i className="bi bi-geo-alt-fill me-2"></i>
                      {deal.location.branch_name}, {deal.city}
                    </p>
                    <p>
                      <i className="bi bi-house-door-fill me-2"></i>
                      <a
                        href={`https://maps.google.com/?q=${deal.location.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {deal.location.address}
                      </a>
                    </p>
                    <p>
                      <i className="bi bi-telephone-fill me-2"></i>
                      {deal.location.phone || "N/A"}
                    </p>
                    <p>
                      <i className="bi bi-ticket-fill me-2"></i>
                      {deal.offer_code}
                    </p>
                    <p>
                      <i className="bi bi-calendar-event-fill me-2"></i>
                      <strong>{deal.start_date}</strong> to <strong>{deal.end_date}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && deals.length > 0 && (
          <div className="text-center mt-4">
            <button
              onClick={() => fetchDeals(false)}
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

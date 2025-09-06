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
  const [cityInput, setCityInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [deals, setDeals] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);

  const dealsPerPage = 20;

  // Fetch cities & categories for dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      const citiesSnap = await getDocs(collection(db, "cities"));
      const categoriesSnap = await getDocs(collection(db, "categories"));
      setCities(citiesSnap.docs.map((doc) => doc.data()));
      setCategories(categoriesSnap.docs.map((doc) => doc.data()));
    };
    fetchDropdowns();
  }, []);

  // Fetch deals with filters + pagination
  const fetchDeals = async (reset = false) => {
    if (!cityInput || !categoryInput) return;

    setLoading(true);
    setIsFirstTime(false);

    try {
      // 1️⃣ Get city
      const citySnap = await getDocs(
        query(
          collection(db, "cities"),
          where("name", "==", cityInput.trim()),
          where("country", "==", "Canada")
        )
      );
      if (citySnap.empty) {
        setDeals([]);
        setHasMore(false);
        setLoading(false);
        setIsFirstTime(false);
        return;
      }
      const cityId = citySnap.docs[0].data().id;

      // 2️⃣ Get category
      const catSnap = await getDocs(
        query(collection(db, "categories"), where("name", "==", categoryInput))
      );
      if (catSnap.empty) {
        setDeals([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      const categoryId = catSnap.docs[0].data().id;

      // 3️⃣ Get all locations in city
      const locSnap = await getDocs(
        query(collection(db, "locations"), where("city_id", "==", cityId))
      );
      const locations = locSnap.docs.map((doc) => doc.data());
      const locationIds = locations.map((l) => l.id);

      if (locationIds.length === 0) {
        setDeals([]);
        setHasMore(false);
        setLoading(false);
        setIsFirstTime(false);
        return;
      }

      // 4️⃣ Query deals
      let dealsQuery = query(
        collection(db, "deals"),
        where("category_id", "==", categoryId),
        where("location_id", "in", locationIds.slice(0, 10)), // Firestore limitation: 'in' supports max 10
        where("start_date", "<=", dateInput),
        where("end_date", ">=", dateInput),
        orderBy("start_date", "desc"),
        limit(dealsPerPage)
      );

      // For next pages
      if (!reset && lastDoc) {
        dealsQuery = query(dealsQuery, startAfter(lastDoc));
      }

      const dealSnap = await getDocs(dealsQuery);

      // Merge location info into each deal
      const newDeals = dealSnap.docs.map((doc) => {
        const d = doc.data();
        d.location = locations.find((l) => l.id === d.location_id);
        return d;
      });

      setDeals((prev) => (reset ? newDeals : [...prev, ...newDeals]));
      setLastDoc(dealSnap.docs[dealSnap.docs.length - 1] || null);
      setHasMore(dealSnap.docs.length === dealsPerPage);
    } catch (error) {
      console.error("Error fetching deals:", error);
    }

    setLoading(false);
    setIsFirstTime(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLastDoc(null);
    fetchDeals(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* <h1 className="text-2xl font-bold mb-4 text-center mt-5">
        Let's get the best!
      </h1> */}

      <section className="bg-success text-white py-5 rounded-bottom-5">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">
            Find the Best Deals in Your City!
          </h1>
          <p className="lead mb-4">
            Save money, discover offers, and never miss a discount near you.
          </p>

          <form
            onSubmit={handleSubmit}
            className="row g-2 justify-content-center px-5"
          >
            <div className="col-md-4">
              <select
                id="city"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="form-select border-dark border-2"
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                id="category"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="form-select border-dark border-2"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Hidden date */}
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="form-control"
              hidden
            />

            <div className="col-md-2">
              <button
                type="submit"
                className="btn btn-light w-100"
                disabled={loading}
              >
                {loading ? "Searching Deals..." : "Search Deals"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Deals Cards */}
      <div>
        {deals.length > 0 ? (
          <>
            <h1 className="text-2xl mb-4 text-center my-3 fw-bold">
              {" "}
              Top Deals{" "}
            </h1>
            <div className="row justify-content-center">
              {deals.map((deal, idx) => (
                <div key={idx} className="col-12 col-lg-4 d-flex my-2">
                  <div className="card h-100 shadow-sm flex-fill border-success border-2 mx-4">
                    <div className="card-body">
                      <h5 className="card-title text-success fw-bold">
                        {deal.description}
                      </h5>

                      <ul className="list-unstyled mb-3">
                        <li>
                          <strong>Offer Code:</strong> {deal.offer_code}
                        </li>
                        {/* <li>
                          <strong>Where:</strong> {deal.location.chain_name}
                        </li> */}
                      </ul>

                      {deal.location && (
                        <div className="mb-3">
                          <p className="mb-1">
                            <i className="bi bi-shop-window"></i> 
                            {"  "}{deal.location.chain_name}
                            
                            <br />
                            <i className="bi bi-geo-alt"></i>
                            <a
                              className="text-dark"
                              href={`https://www.google.com/maps/place/${deal.location.address}`}
                              target="_blank"
                            >{"  "}{deal.location.address}</a>
                          </p>
                          <p className="mb-0">
                            <i className="bi bi-telephone"></i> 
                            {"  "}{deal.location.phone}
                          </p>
                        </div>
                      )}

                      <p
                        className="card-text text-muted mb-0"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <i className="bi bi-clock"></i>
                        {"  "}{deal.start_date} →{" "}
                        {deal.end_date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="d-flex justify-content-center">
                <button
                  onClick={() => fetchDeals(false)}
                  disabled={loading}
                  className="btn btn-success my-3"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        ) : isFirstTime ? (
          ""
        ) : (
          <p className="text-gray-500 text-center">No deals found.</p>
        )}
      </div>

      <section className="my-5" id="About">
        <div className="container">
              <h2 className="fw-bold mb-4 text-center">About Us</h2>
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-3">
                Deals In My City! is your go-to platform to discover amazing
                local deals and discounts. We help you save money while
                exploring restaurants, cafes, shopping outlets, and more in your
                city. Our mission is to connect users with the best offers
                around them quickly and efficiently.
              </p>
              <p>
                Whether you’re looking for a quick snack, a weekend outing, or
                the latest electronics, we bring all the deals to one place —
                making your life simpler and more affordable.
              </p>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="https://picsum.photos/400/300"
                alt="About Us"
                className="img-fluid rounded shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-light py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">How It Works</h2>
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="card border-0 bg-success">
                <div className="card-body text-light">
                  <i className="bi bi-geo-alt fs-1 mb-2"></i>
                  <h5 className="card-title">Select Your City</h5>
                  <p className="card-text">
                    Select your city to find all deals near you instantly.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-success">
                <div className="card-body text-light">
                  <i className="bi bi-tags fs-1 mb-2"></i>
                  <h5 className="card-title">Browse Deals</h5>
                  <p className="card-text">
                    Explore food, cafe, and shopping deals at your favorite
                    places.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-success">
                <div className="card-body text-light">
                  <i className="bi bi-cart-check fs-1 mb-2"></i>
                  <h5 className="card-title">Save & Enjoy</h5>
                  <p className="card-text">
                    Use the offers, save money, and enjoy amazing experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Explore by Category</h2>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {[
              "Pizza",
              "Burgers",
              "Movies",
              "Spa",
              "Gym",
              "Garba Concert",
              "Tower",
              "Hiking",
              "Coffee",
              "Sushi",
            ].map((cat) => (
              <button key={cat} className="btn btn-outline-success btn-lg">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">What Our Users Say</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className="card p-3 shadow-sm bg-success">
                <div className="card-body">
                  <p className="card-text text-white fst-italic">
                    “I love how simple it is to find the best deals in my city!
                    Last week, I discovered a new coffee shop offering 50% off —
                    wouldn’t have known without this site.”
                  </p>
                  <h6 className="card-subtitle text-muted">- Emily</h6>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 shadow-sm bg-success">
                <div className="card-body">
                  <p className="card-text text-white fst-italic">
                    “The platform is a lifesaver. I was able to save money and
                    even find local restaurants I had never tried before. Highly
                    recommended!”
                  </p>
                  <h6 className="card-subtitle text-muted">- Jason</h6>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 shadow-sm bg-success">
                <div className="card-body">
                  <p className="card-text text-white fst-italic">
                    “Clean design, easy to use, and most importantly — genuine
                    deals. This has become my go-to app whenever I’m planning to
                    shop or eat out.”
                  </p>
                  <h6 className="card-subtitle text-muted">- Samantha</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" id="Contact">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Contact Us</h2>
          <div className="row justify-content-center">
            <div className="col-md-8">
              {/* <form>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Your Name</label>
            <input type="text" className="form-control" id="name" placeholder="Enter your name" required />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" placeholder="name@example.com" required />
          </div>
          <div className="mb-3">
            <label htmlFor="message" className="form-label">Message</label>
            <textarea className="form-control" id="message" rows="5" placeholder="Type your message..." required></textarea>
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Send Message</button>
          </div>
        </form> */}
              <div className="mt-4 text-center">
                {/* <p className="mb-1">
                  <strong>Phone:</strong> +1 416-555-1234
                </p> */}
                <p className="mb-0">
                  <strong>Email:</strong> askdealsinmycity@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

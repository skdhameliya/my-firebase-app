import React, { useState } from "react";
import { db } from "./firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs } from "firebase/firestore";
import citiesData from "../src/data/cities.json";
import categoriesData from "../src/data/categories.json";
import Select from "react-select";

export default function DealsList2() {
  const [cityName, setCityName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [deals, setDeals] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // For "Load More"

  const pageSize = 20;

  const fetchDeals = async (reset = true) => {
  if (!cityName || !categoryName) return;
  
  if (reset) {
    setLoading(true);
  } else {
    setLoadingMore(true);
  }

  try {
    let q = query(
  collection(db, "deals1"),
  where("city_name", "==", cityName),
  where("category_name", "==", categoryName),
  where("status", "==", 1), // ✅ Only approved deals
  orderBy("start_date", "desc"),
  limit(pageSize)
);


    if (!reset && lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const newDeals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDeals(reset ? newDeals : [...deals, ...newDeals]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === pageSize);
    } else {
      if (reset) setDeals([]);
      setHasMore(false);
    }
  } catch (err) {
    console.error("Error fetching deals:", err);
  }

  if (reset) {
    setLoading(false);
  } else {
    setLoadingMore(false);
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    setLastDoc(null);
    setHasMore(true);
    fetchDeals(true);
  };

// Convert data to options for react-select (sorted alphabetically)
const cityOptions = citiesData
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((c) => ({
    value: c.name,
    label: `${c.name}, ${c.province}`,
  }));

const categoryOptions = categoriesData
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));


  return (
    <div className="container-fluid">
      {/* Filters */}
      <form onSubmit={handleSubmit} className="row bg-success mb-4 text-center py-4 rounded-bottom-5">
        <h1 className="display-4 text-light fw-bold">Find the Best Deals in Your City!</h1>
        <p className="lead mb-4 text-light">
          Save money, discover offers, and never miss a discount near you.
        </p>

        {/* Centered dropdowns */}
<div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
  <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
    {/* <label className="form-label text-light">City</label> */}
    <Select
      options={cityOptions}
      value={cityOptions.find((c) => c.value === cityName) || null}
      onChange={(selected) => setCityName(selected ? selected.value : "")}
      placeholder="Search or Select City"
      isClearable
    />
  </div>

  <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
    {/* <label className="form-label text-light">Category</label> */}
    <Select
      options={categoryOptions}
      value={categoryOptions.find((c) => c.value === categoryName) || null}
      onChange={(selected) => setCategoryName(selected ? selected.value : "")}
      placeholder="Search or Select Category"
      isClearable
    />
  </div>

  {/* Submit Button */}
  <div className="mb-3 w-100" style={{ maxWidth: "300px" }}>
    <label className="form-label text-light"></label>

    <button
      type="submit"
      className="btn btn-success btn-outline-dark px-4 w-100"
      disabled={loading}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Searching...
        </>
      ) : (
        "Submit"
      )}
    </button>
  </div>
</div>


      </form>

      {/* Results */}
      <div className="container py-4">
        <div className="row g-3">
          {loading && (
            <div className="col-12 text-center my-4">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Searching deals...</p>
            </div>
          )}

          {!loading && deals.length > 0 ? (
            deals.map((deal) => (
              <div key={deal.id} className="col-12 col-lg-4">
                <div className="card h-100 shadow-lg rounded">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                      
                      {deal.description.toUpperCase()}
                    </h5>
                      
                    <p className="card-text"><i className="bi bi-tag-fill me-2"></i>{deal.offer_code}</p>
                    <p className="text-muted mb-2">
                      <i className="bi bi-calendar-event me-1"></i>
                      Start: {deal.start_date} | End: {deal.end_date}
                    </p>
                    

                    {deal.location && (
                      <div className="mt-auto text-muted">
                        {/* <strong>
                          <i className="bi bi-geo-alt-fill me-1"></i>
                          Location Info:
                        </strong> */}
                        {/* <p>
                          <i className="bi bi-building me-1"></i>
                          Chain: {deal.location.chain_name}
                        </p> */}
                        
                        <p>
                          <i className="bi bi-shop me-1"></i>
                          {deal.location.branch_name}
                        </p>
                        <p>
                          <i className="bi bi-house-door me-1"></i>
                          Address:{" "}
                          <a
                          className="link-underline link-underline-opacity-0"
                            href={`https://www.google.com/maps/place/${deal.location.address}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {deal.location.address}
                          </a>
                        </p>
                        <p>
  <i className="bi bi-telephone-fill me-1"></i>
  Phone:{" "}
  <a href={`tel:${deal.location.phone}`} className="text-decoration-none">
    {deal.location.phone}
  </a>
</p>

                      </div>
                    )}
                    {deal.instagram_url && (
                      <p className="mb-2">
                        <a href={deal.instagram_url} target="_blank" rel="noreferrer" className="text-decoration-none">
                          <i className="bi bi-instagram me-1"> find more</i> 
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            !loading && (
              <div className="col-12">
                <p className="text-center text-muted">Select city and category.</p>
              </div>
            )
          )}
        </div>
      </div>

      {hasMore && deals.length > 0 && (
  <center>
    <button
    className="btn btn-success"
    onClick={() => fetchDeals(false)}
    disabled={loadingMore}
  >
    {loadingMore ? (
      <>
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        Loading...
      </>
    ) : (
      "Load More"
    )}
  </button>
  </center>
)}


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

      <section className="bg-light py-5" id="Contact">
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


    </div>
  );
}

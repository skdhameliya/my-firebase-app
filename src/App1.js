import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cityName, setCityName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [results, setResults] = useState([]);

  // Load cities and categories once
  useEffect(() => {
    const fetchData = async () => {
      const citiesSnap = await getDocs(collection(db, "cities"));
      setCities(citiesSnap.docs.map(doc => doc.data()));

      const categoriesSnap = await getDocs(collection(db, "categories"));
      setCategories(categoriesSnap.docs.map(doc => doc.data()));
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    // Find city ID by name
    const city = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!city) {
      alert("City not found");
      return;
    }

    // Find locations in that city
    const locationsSnap = await getDocs(
      query(collection(db, "locations"), where("city_id", "==", city.id))
    );
    const locations = locationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch deals for selected category
    const dealsResults = [];
    for (const loc of locations) {
      const dealsSnap = await getDocs(
        query(
          collection(db, "deals"),
          where("location_id", "==", loc.id),
          where("category_id", "==", parseInt(categoryId))
        )
      );
      dealsSnap.forEach(dealDoc => {
        dealsResults.push({
          location: loc.branch_name,
          address: loc.address,
          ...dealDoc.data()
        });
      });
    }

    setResults(dealsResults);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Find Deals</h1>
      <div>
        <input
          type="text"
          placeholder="Enter city name"
          value={cityName}
          onChange={e => setCityName(e.target.value)}
        />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button onClick={handleSearch}>Search</button>
      </div>

      <h2>Results:</h2>
      {results.length === 0 ? (
        <p>No deals found</p>
      ) : (
        <ul>
          {results.map((deal, index) => (
            <li key={index}>
              <strong>{deal.location}</strong> ({deal.address}) - {deal.description} | Offer Code: {deal.offer_code}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs
} from "firebase/firestore";

const PAGE_SIZE = 10;

export default function DealsList1({ cityCategoryId }) {
  const [deals, setDeals] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setDeals([]);
    setLastDoc(null);
    setHasMore(true);
    console.log(cityCategoryId)
    if (cityCategoryId) fetchDeals();
    // eslint-disable-next-line
  }, [cityCategoryId]);

  const fetchDeals = async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    const [city, category] = cityCategoryId.split("@");
    console.log(city, category)
    const dealsRef = collection(db, "cities", city, "categories", category, "deals");

    let q = query(dealsRef, orderBy("start_date"), limit(PAGE_SIZE));

    if (lastDoc) {
      q = query(dealsRef, orderBy("start_date"), startAfter(lastDoc), limit(PAGE_SIZE));
    }

    const snapshot = await getDocs(q);

    console.log(snapshot.docs)
    if (!snapshot.empty) {
      const newDeals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeals(prev => [...prev, ...newDeals]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < PAGE_SIZE) setHasMore(false);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 100 >=
      document.documentElement.offsetHeight
    ) {
      fetchDeals();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [lastDoc, hasMore, loading]);

  return (
    <div>
      <h2>Deals</h2>
      {deals.length === 0 && !loading && <p>No deals found.</p>}
      <ul>
        {deals.map(deal => (
          <li key={deal.id}>
            <strong>{deal.description}</strong> | {deal.start_date} - {deal.end_date}
          </li>
        ))}
      </ul>
      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more deals.</p>}
    </div>
  );
}

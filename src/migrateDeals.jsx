// migrateDeals.js
import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

export async function migrateDeals() {
  try {
    // Fetch reference data
    const citiesSnap = await getDocs(collection(db, "cities"));
    const categoriesSnap = await getDocs(collection(db, "categories"));
    const locationsSnap = await getDocs(collection(db, "locations"));

    // Build lookup maps (id → Firestore doc.id)
    const cityMap = {};
    citiesSnap.forEach((d) => {
      const data = d.data();
      if (data.id) cityMap[data.id] = d.id; // numeric → Firestore string ID
    });

    const categoryMap = {};
    categoriesSnap.forEach((d) => {
      const data = d.data();
      if (data.id) categoryMap[data.id] = d.id;
    });

    const locationMap = {};
    locationsSnap.forEach((d) => {
      const data = d.data();
      if (data.id) locationMap[data.id] = d.id;
    });

    // Fetch deals
    const dealsSnap = await getDocs(collection(db, "deals"));

    for (const dealDoc of dealsSnap.docs) {
      const deal = dealDoc.data();
      const updates = {};

      // If deal has numeric city_id, replace with Firestore string id
      if (deal.city_id && typeof deal.city_id === "number" && cityMap[deal.city_id]) {
        updates.city_id = cityMap[deal.city_id];
      }

      if (deal.category_id && typeof deal.category_id === "number" && categoryMap[deal.category_id]) {
        updates.category_id = categoryMap[deal.category_id];
      }

      if (deal.location_id && typeof deal.location_id === "number" && locationMap[deal.location_id]) {
        updates.location_id = locationMap[deal.location_id];
      }

      if (Object.keys(updates).length > 0) {
        console.log(`Updating deal ${dealDoc.id}:`, updates);
        await updateDoc(doc(db, "deals", dealDoc.id), updates);
      }
    }

    console.log("✅ Migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  }
}

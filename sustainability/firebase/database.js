// firebase/database.js
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

/** 1) Read: get all events (fetch once) */
export const getEvents = async () => {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** 2) Write: add a single event */
export const addEvent = async (event) => {
  // event should include: title, lat, lng (numbers). Others optional.
  const docRef = await addDoc(collection(db, "events"), {
    ...event,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/** 3) Seed: add a bunch of fake events for demo */
export const seedFakeEvents = async () => {
  const demoEvents = [
    {
      title: "Park Cleanup",
      description: "Meet by the fountain. Gloves provided.",
      lat: 40.4419,
      lng: -79.9416,
      tags: ["cleanup"],
    },
    {
      title: "Recycling Drive",
      description: "Bring e-waste + batteries.",
      lat: 40.444,
      lng: -79.953,
      tags: ["recycling"],
    },
    {
      title: "Tree Planting",
      description: "Help plant 50 saplings!",
      lat: 40.452,
      lng: -79.945,
      tags: ["trees"],
    },
  ];

  // Add them sequentially (simple + safe)
  for (const ev of demoEvents) {
    await addEvent(ev);
  }

  return demoEvents.length;
};

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
      title: "Walked",
      description: "Walked instead of driving.",
      lat: 40.4419,
      lng: -79.9416,
      tags: ["transportation"],
    },
    {
      title: "Biked",
      description: "Biked to destination.",
      lat: 40.444,
      lng: -79.953,
      tags: ["transportation"],
    },
    {
      title: "Drove",
      description: "Drove to location.",
      lat: 40.452,
      lng: -79.945,
      tags: ["transportation"],
    },
    {
      title: "Thrifted",
      description: "Bought secondhand items.",
      lat: 40.448,
      lng: -79.948,
      tags: ["shopping"],
    },
    {
      title: "Ate plant-based",
      description: "Chose plant-based meal option.",
      lat: 40.443,
      lng: -79.950,
      tags: ["food"],
    },
    {
      title: "Recycled",
      description: "Properly recycled materials.",
      lat: 40.441,
      lng: -79.944,
      tags: ["recycling"],
    },
    {
      title: "Compostable product",
      description: "Used or purchased compostable products.",
      lat: 40.440,
      lng: -79.946,
      tags: ["shopping"],
    },
    {
      title: "Lights off",
      description: "Turned off lights when not in use.",
      lat: 40.445,
      lng: -79.949,
      tags: ["energy"],
    },
    {
      title: "Tap off while brushing",
      description: "Turned off tap while brushing teeth.",
      lat: 40.442,
      lng: -79.947,
      tags: ["water"],
    },
    {
      title: "Refill bottle",
      description: "Refilled reusable water bottle.",
      lat: 40.446,
      lng: -79.943,
      tags: ["shopping"],
    },
    {
      title: "No AI usage",
      description: "Completed task without using AI.",
      lat: 40.443,
      lng: -79.951,
      tags: ["community"],
    },
  ];

  // Add them sequentially (simple + safe)
  for (const ev of demoEvents) {
    await addEvent(ev);
  }

  return demoEvents.length;
};

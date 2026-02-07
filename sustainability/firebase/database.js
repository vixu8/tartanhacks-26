// firebase/database.js
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import { applyImpactToUser } from "../lib/points/applyImpact";
import { getImpactForEvent } from "../lib/points/impacts";
import { pointsToTreeStage } from "../lib/points/treeStage";

// Repo currently has no auth session hook; use a stable per-device/app user key until auth is added.
const DEFAULT_USER_ID = "demo-user";

export const getCurrentUserId = () => DEFAULT_USER_ID;

/** 1) Read: get all events (fetch once) */
export const getEvents = async () => {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** 2) Write: add a single event */
export const addEvent = async (event) => {
  const impact = getImpactForEvent({
    kind: event?.kind,
    name: event?.name,
    title: event?.title,
    sustainable: event?.sustainable,
  });

  // event should include: title, lat, lng (numbers). Others optional.
  const docRef = await addDoc(collection(db, "events"), {
    ...event,
    impact,
    createdAt: serverTimestamp(),
  });

  await applyImpactToUser({
    db,
    userId: getCurrentUserId(),
    impact,
    eventId: docRef.id,
  });

  return docRef.id;
};

export const getCurrentUserTreeState = async () => {
  const userRef = doc(db, "users", getCurrentUserId());
  const userSnap = await getDoc(userRef);
  const rawPoints = userSnap.exists() ? userSnap.data()?.points : 0;
  const points = typeof rawPoints === "number" ? rawPoints : 0;

  return {
    treeStage: pointsToTreeStage(points),
  };
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

// Get coin count
export const getCoinCount = async () => {
  const docRef = doc(db, "game", "coins");
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data().count || 0;
  } else {
    // Initialize if doesn't exist
    await setDoc(docRef, { count: 0 });
    return 0;
  }
};

// Set coin count to specific value
export const setCoinCount = async (amount) => {
  const docRef = doc(db, "game", "coins");
  await setDoc(docRef, { count: amount });
};

// Add coins (can use negative to subtract)
export const addCoins = async (amount) => {
  const docRef = doc(db, "game", "coins");
  await updateDoc(docRef, {
    count: increment(amount)
  });
};

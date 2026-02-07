// firebase/database.js
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

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
    id: "1",
    title: "Used reusable water bottle",
    points: 10,
    description: "Avoided single-use plastic by bringing a reusable water bottle to work.",
    date: "2026-02-07",
    tags: ["water"],
  },
  {
    id: "2",
    title: "Carpooled to work",
    points: 15,
    description: "Shared a ride with 3 colleagues, reducing carbon emissions.",
    date: "2026-02-07",
    tags: ["transport"],
  },
  {
    id: "3",
    title: "Drove alone to the store",
    points: -5,
    description: "Could have walked or biked for this short trip.",
    date: "2026-02-07",
    tags: ["transport"],
  },
  {
    id: "4",
    title: "Recycled paper waste",
    points: 5,
    description: "Properly sorted and recycled all paper materials.",
    date: "2026-02-06",
    tags: ["food", "waste"],
  },
  {
    id: "5",
    title: "Used plastic bags at grocery",
    points: -3,
    description: "Forgot to bring reusable shopping bags.",
    date: "2026-02-06",
    tags: ["water", "waste"],
  },
  {
    id: "6",
    title: "Composted food scraps",
    points: 8,
    description: "Diverted organic waste from landfill.",
    date: "2026-02-05",
    tags: ["food", "waste"],
  },
  {
    id: "7",
    title: "Took public transportation",
    points: 12,
    description: "Used the bus instead of driving.",
    date: "2026-02-05",
    tags: ["transport"],
  },
  {
    id: "8",
    title: "Left lights on overnight",
    points: -4,
    description: "Wasted electricity by leaving multiple lights on.",
    date: "2026-02-04",
    tags: ["water"],
  },
    {
    id: "9",
    title: "Lfeshts on overnight",
    points: -1,
    description: "ectricity by leaving multiple lights on.",
    date: "2026-02-09",
    tags: ["food"],
  },
    {
    id: "10",
    title: "ernight",
    points: 4,
    description: "Wasted elecaving multiple lights on.",
    date: "2026-02-10",
    tags: ["transport"],
  },
    {
    id: "11",
    title: "Light",
    points: 10,
    description: "Wasple lights on.",
    date: "2026-02-12",
    tags: ["water"],
  },
    {
    id: "12",
    title: "Left lights on overnight",
    points: -4,
    description: "Wasted electricity by leaving multiple lights on.",
    date: "2026-02-04",
    tags: ["food"],
  },
    {
    id: "13",
    title: "Left lights on overnight",
    points: -4,
    description: "Wasted electricity by leaving multiple lights on.",
    date: "2026-02-04",
    tags: ["transport"],
  },
    {
    id: "14",
    title: "Left lights on overnight",
    points: -4,
    description: "Wasted electricity by leaving multiple lights on.",
    date: "2026-02-04",
    tags: ["water"],
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
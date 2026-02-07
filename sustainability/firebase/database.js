// firebase/database.js
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

/** 1) Read: get all events (fetch once) */
export const getEvents = async () => {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** 1b) Real-time listener for events */
export const subscribeToEvents = (callback) => {
  const q = query(collection(db, "events"), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(events);
  }, (error) => {
    console.error("Error listening to events:", error);
  });

  return unsubscribe; // Return the unsubscribe function
};

/** 2) Write: add a single event */
export const addEvent = async (event) => {
  // Get current count of events to determine the next id
  const snap = await getDocs(collection(db, "events"));
  const nextId = snap.size + 1;

  const docRef = await addDoc(collection(db, "events"), {
    ...event,
    id: nextId.toString(),
    createdAt: serverTimestamp(),
  });

  // Update points and coins
  try {
    // Add the event's points to game/points
    const pointsRef = doc(db, "game", "points");
    const pointsSnap = await getDoc(pointsRef);
    if (!pointsSnap.exists()) {
      await setDoc(pointsRef, { count: 0 });
    }
    await updateDoc(pointsRef, {
      count: increment(event.points || 0)
    });

    // Add 5 coins to game/coins
    const coinsRef = doc(db, "game", "coins");
    const coinsSnap = await getDoc(coinsRef);
    if (!coinsSnap.exists()) {
      await setDoc(coinsRef, { count: 0 });
    }
    await updateDoc(coinsRef, {
      count: increment(5)
    });
  } catch (error) {
    console.error("Error updating points/coins:", error);
  }

  return docRef.id;
};

/** 3) Seed: add a bunch of fake events for demo */
export const seedFakeEvents = async (n) => {
  // Collections to randomly pick from
  const titles = [
    "Used reusable water bottle",
    "Carpooled to work",
    "Drove alone to the store",
    "Recycled paper waste",
    "Used plastic bags at grocery",
    "Composted food scraps",
    "Took public transportation",
    "Left lights on overnight",
    "Biked to work",
    "Ate a plant-based meal",
    "Wasted food",
    "Used solar panels",
    "Took a long shower",
    "Walked instead of driving",
    "Bought fast fashion",
    "Thrifted clothing",
    "Unplugged electronics",
    "Left AC running all day",
    "Started a garden",
    "Used single-use plastics"
  ];

  const descriptions = [
    "Avoided single-use plastic by bringing a reusable water bottle to work.",
    "Shared a ride with colleagues, reducing carbon emissions.",
    "Could have walked or biked for this short trip.",
    "Properly sorted and recycled all paper materials.",
    "Forgot to bring reusable shopping bags.",
    "Diverted organic waste from landfill.",
    "Used the bus instead of driving.",
    "Wasted electricity by leaving multiple lights on.",
    "Zero emissions commute today.",
    "Reduced meat consumption for environmental benefit.",
    "Let leftovers go bad in the fridge.",
    "Renewable energy powered the house today.",
    "Used excessive water during morning routine.",
    "Chose active transportation over driving.",
    "Contributed to textile waste and pollution.",
    "Sustainable fashion choice reduced waste.",
    "Prevented phantom energy drain.",
    "Unnecessarily cooled an empty house.",
    "Growing own vegetables reduces food miles.",
    "Added more plastic to landfills."
  ];

  const tagOptions = ["water", "transport", "food", "waste", "energy"];

  // Helper function to get random element from array
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Helper function to get random number of tags (1-3)
  const getRandomTags = () => {
    const numTags = Math.floor(Math.random() * 3) + 1;
    const tags = new Set();
    while (tags.size < numTags) {
      tags.add(getRandom(tagOptions));
    }
    return Array.from(tags);
  };

  // Helper function to get random date in the past 14 days
  const getRandomDate = () => {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 14);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  // Helper function to get random time in 12-hour format
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 12) + 1; // 1-12
    const minutes = Math.floor(Math.random() * 60); // 0-59
    const meridiem = Math.random() < 0.5 ? 'AM' : 'PM';
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${hours}:${formattedMinutes} ${meridiem}`;
  };

  // Generate n random events
  const demoEvents = [];
  for (let i = 0; i < n; i++) {
    const points = Math.floor(Math.random() * 201) - 100; // -100 to 100
    demoEvents.push({
      title: getRandom(titles),
      points: points,
      description: getRandom(descriptions),
      date: getRandomDate(),
      time: getRandomTime(),
      tags: getRandomTags(),
    });
  }

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

// Get points count
export const getPointsCount = async () => {
  const docRef = doc(db, "game", "points");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().count || 0;
  } else {
    // Initialize if doesn't exist
    await setDoc(docRef, { count: 0 });
    return 0;
  }
};

// Set points count to specific value
export const setPointsCount = async (amount) => {
  const docRef = doc(db, "game", "points");
  await setDoc(docRef, { count: amount });
};

// Add points (can use negative to subtract)
export const addPoints = async (amount) => {
  const docRef = doc(db, "game", "points");
  await updateDoc(docRef, {
    count: increment(amount)
  });
};
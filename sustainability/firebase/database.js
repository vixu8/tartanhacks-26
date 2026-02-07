import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// Log an activity
export const logActivity = async (userId, activityData) => {
  try {
    const docRef = await addDoc(collection(db, 'activities'), {
      userId,
      ...activityData,
      timestamp: Timestamp.now(),
      points: calculatePoints(activityData) // you'll create this function
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get user's activities
export const getUserActivities = async (userId) => {
  try {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Get nearby events (you'll need to add GeoPoint when creating events)
export const getNearbyEvents = async (userLat, userLng, radiusKm = 10) => {
  // For hackathon, you can start simple and just get all events
  // Then filter by distance in your app
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Helper function - customize based on your point system
const calculatePoints = (activityData) => {
  // Example logic
  const pointsMap = {
    'bike': 10,
    'walk': 8,
    'public_transport': 5,
    'reusable_bag': 3,
    // etc.
  };
  return pointsMap[activityData.type] || 1;
};
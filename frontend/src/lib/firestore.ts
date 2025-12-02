import { collection, getDocs, doc, setDoc, query, where, addDoc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Mechanic {
  id: string;
  userId?: string; // Link to the user account
  name: string;
  phone: string;
  workshop_name: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  is_open: boolean;
  photo: string;
  reviews_count: number;
  city?: string;
}

export interface Request {
  id?: string;
  userId: string;
  mechanicId: string;
  userName: string;
  mechanicName: string;
  serviceType: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const getMechanics = async (): Promise<Mechanic[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'mechanics'));
    const mechanics: Mechanic[] = [];
    querySnapshot.forEach((doc) => {
      mechanics.push({ id: doc.id, ...doc.data() } as Mechanic);
    });
    return mechanics;
  } catch (error) {
    console.error('Error fetching mechanics:', error);
    return [];
  }
};

export const seedMechanicsData = async () => {
  const mechanicsData = [
    {
      name: 'John Smith',
      phone: '+1234567890',
      workshop_name: 'Smith Auto Repair',
      latitude: 40.7128,
      longitude: -74.0060,
      services: ['car', 'emergency'],
      rating: 4.5,
      is_open: true,
      photo: 'https://via.placeholder.com/100',
      reviews_count: 23
    },
    {
      name: 'Maria Garcia',
      phone: '+1234567891',
      workshop_name: 'Garcia Bike Service',
      latitude: 40.7589,
      longitude: -73.9851,
      services: ['bike', 'emergency'],
      rating: 4.8,
      is_open: true,
      photo: 'https://via.placeholder.com/100',
      reviews_count: 45
    },
    {
      name: 'Ahmed Hassan',
      phone: '+1234567892',
      workshop_name: 'Hassan Motors',
      latitude: 40.7282,
      longitude: -73.7949,
      services: ['car', 'truck', 'towing'],
      rating: 4.2,
      is_open: false,
      photo: 'https://via.placeholder.com/100',
      reviews_count: 18
    }
  ];

  try {
    for (const mechanic of mechanicsData) {
      await setDoc(doc(collection(db, 'mechanics')), mechanic);
    }
    console.log('Mechanics data seeded successfully');
  } catch (error) {
    console.error('Error seeding mechanics data:', error);
  }
};

export const createRequest = async (requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'requests'), {
      ...requestData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const getUserRequests = async (userId: string): Promise<Request[]> => {
  try {
    const q = query(collection(db, 'requests'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const requests: Request[] = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as Request);
    });
    return requests.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return [];
  }
};

export const getMechanicRequests = async (mechanicId: string): Promise<Request[]> => {
  try {
    const q = query(collection(db, 'requests'), where('mechanicId', '==', mechanicId));
    const querySnapshot = await getDocs(q);
    const requests: Request[] = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as Request);
    });
    return requests.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error) {
    console.error('Error fetching mechanic requests:', error);
    return [];
  }
};

export const updateRequestStatus = async (requestId: string, status: Request['status']): Promise<void> => {
  try {
    await updateDoc(doc(db, 'requests', requestId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Get mechanic by user ID
export const getMechanicByUserId = async (userId: string): Promise<Mechanic | null> => {
  try {
    const q = query(collection(db, 'mechanics'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const mechanicDoc = querySnapshot.docs[0];
    return { id: mechanicDoc.id, ...mechanicDoc.data() } as Mechanic;
  } catch (error) {
    console.error('Error fetching mechanic by user ID:', error);
    return null;
  }
};

// Get a single mechanic by ID
export const getMechanicById = async (mechanicId: string): Promise<Mechanic | null> => {
  try {
    const mechanicDoc = await getDoc(doc(db, 'mechanics', mechanicId));

    if (!mechanicDoc.exists()) {
      return null;
    }

    return { id: mechanicDoc.id, ...mechanicDoc.data() } as Mechanic;
  } catch (error) {
    console.error('Error fetching mechanic:', error);
    return null;
  }
};

// Create a new mechanic profile
export const createMechanicProfile = async (
  userId: string,
  profileData: Omit<Mechanic, 'id' | 'userId'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'mechanics'), {
      userId,
      ...profileData,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating mechanic profile:', error);
    throw error;
  }
};

// Update an existing mechanic profile
export const updateMechanicProfile = async (
  mechanicId: string,
  profileData: Partial<Omit<Mechanic, 'id' | 'userId'>>
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'mechanics', mechanicId), profileData);
  } catch (error) {
    console.error('Error updating mechanic profile:', error);
    throw error;
  }
};

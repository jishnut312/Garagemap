import { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Workshop {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  services: string[];
  phone: string;
  lat: number;
  lng: number;
  isActive?: boolean;
}

// Mock data as fallback
const mockWorkshops: Workshop[] = [
  {
    id: '1',
    name: "AutoCare Pro Workshop",
    address: "123 Main Street, Downtown",
    rating: 4.8,
    distance: "0.5 km",
    services: ["Engine Repair", "Brake Service", "Oil Change", "Transmission"],
    phone: "+1 234-567-8901",
    lat: 40.7128,
    lng: -74.0060,
    isActive: true
  },
  {
    id: '2',
    name: "Elite Motor Services",
    address: "456 Oak Avenue, Midtown",
    rating: 4.6,
    distance: "1.2 km",
    services: ["Transmission", "AC Repair", "Diagnostics", "Electrical"],
    phone: "+1 234-567-8902",
    lat: 40.7589,
    lng: -73.9851,
    isActive: true
  },
  {
    id: '3',
    name: "Quick Fix Garage",
    address: "789 Pine Road, Uptown",
    rating: 4.4,
    distance: "2.1 km",
    services: ["Tire Service", "Battery", "Inspection", "Alignment"],
    phone: "+1 234-567-8903",
    lat: 40.7831,
    lng: -73.9712,
    isActive: true
  },
  {
    id: '4',
    name: "Premium Auto Center",
    address: "321 Broadway, Central",
    rating: 4.9,
    distance: "0.8 km",
    services: ["Luxury Cars", "Detailing", "Performance", "Maintenance"],
    phone: "+1 234-567-8904",
    lat: 40.7505,
    lng: -73.9934,
    isActive: true
  },
  {
    id: '5',
    name: "City Mechanics Hub",
    address: "654 Park Avenue, East Side",
    rating: 4.3,
    distance: "1.8 km",
    services: ["General Repair", "Bodywork", "Paint", "Insurance Claims"],
    phone: "+1 234-567-8905",
    lat: 40.7282,
    lng: -73.9942,
    isActive: true
  }
];

export const useWorkshops = (realTime: boolean = false) => {
  const [workshops, setWorkshops] = useState<Workshop[]>(mockWorkshops);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        setLoading(true);
        setError(null);

        if (realTime) {
          // Real-time listener
          const unsubscribe = onSnapshot(
            collection(db, 'workshops'),
            (snapshot) => {
              const workshopData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Workshop))
                .filter(workshop => workshop.isActive !== false);
              
              if (workshopData.length > 0) {
                setWorkshops(workshopData);
              } else {
                // Fallback to mock data if no Firestore data
                setWorkshops(mockWorkshops);
              }
              setLoading(false);
            },
            (err) => {
              console.warn('Firestore error, using mock data:', err);
              setWorkshops(mockWorkshops);
              setError('Using offline data');
              setLoading(false);
            }
          );

          return unsubscribe;
        } else {
          // One-time fetch
          const snapshot = await getDocs(collection(db, 'workshops'));
          const workshopData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Workshop))
            .filter(workshop => workshop.isActive !== false);
          
          if (workshopData.length > 0) {
            setWorkshops(workshopData);
          } else {
            // Fallback to mock data if no Firestore data
            setWorkshops(mockWorkshops);
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Firestore error, using mock data:', err);
        setWorkshops(mockWorkshops);
        setError('Using offline data');
        setLoading(false);
      }
    };

    loadWorkshops();
  }, [realTime]);

  return { workshops, loading, error };
};

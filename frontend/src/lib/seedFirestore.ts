// Firestore Test Data Seeding Script
// Run this once to populate your Firestore with test data

import { db } from './firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';

// Test user IDs (you'll need to create these users in Firebase Auth first)
const TEST_CUSTOMER_UID = 'test_customer_001'; // Replace with actual Firebase Auth UID
const TEST_MECHANIC_UID = 'test_mechanic_001'; // Replace with actual Firebase Auth UID

export const seedFirestoreData = async () => {
    try {
        console.log('🌱 Starting Firestore data seeding...');

        // 1. Create test users
        console.log('📝 Creating users...');

        // Customer user
        await setDoc(doc(db, 'users', TEST_CUSTOMER_UID), {
            email: 'customer@test.com',
            displayName: 'Test Customer',
            userType: 'customer',
            photoURL: 'https://via.placeholder.com/100',
            createdAt: Timestamp.now(),
        });
        console.log('✅ Customer user created');

        // Mechanic user
        await setDoc(doc(db, 'users', TEST_MECHANIC_UID), {
            email: 'mechanic@test.com',
            displayName: 'Test Mechanic',
            userType: 'mechanic',
            photoURL: 'https://via.placeholder.com/100',
            createdAt: Timestamp.now(),
        });
        console.log('✅ Mechanic user created');

        // 2. Create mechanic profiles
        console.log('🔧 Creating mechanic profiles...');

        const mechanic1Ref = doc(collection(db, 'mechanics'));
        await setDoc(mechanic1Ref, {
            userId: TEST_MECHANIC_UID,
            name: 'John Smith',
            phone: '+1-555-0101',
            workshop_name: 'Smith Auto Repair',
            latitude: 40.7128,
            longitude: -74.0060,
            services: ['car', 'emergency', 'towing'],
            rating: 4.8,
            is_open: true,
            photo: 'https://via.placeholder.com/100',
            reviews_count: 45,
        });
        console.log('✅ Mechanic profile created:', mechanic1Ref.id);

        // Add more mechanics
        const mechanic2Ref = doc(collection(db, 'mechanics'));
        await setDoc(mechanic2Ref, {
            userId: '', // Additional mechanic without user account
            name: 'Maria Garcia',
            phone: '+1-555-0102',
            workshop_name: 'Garcia Bike Service',
            latitude: 40.7589,
            longitude: -73.9851,
            services: ['bike', 'emergency'],
            rating: 4.9,
            is_open: true,
            photo: 'https://via.placeholder.com/100',
            reviews_count: 67,
        });
        console.log('✅ Second mechanic profile created:', mechanic2Ref.id);

        // 3. Create sample service requests
        console.log('📋 Creating service requests...');

        const now = Timestamp.now();

        // Pending request
        await setDoc(doc(collection(db, 'requests')), {
            userId: TEST_CUSTOMER_UID,
            mechanicId: mechanic1Ref.id,
            userName: 'Test Customer',
            mechanicName: 'John Smith',
            serviceType: 'car',
            status: 'pending',
            urgency: 'high',
            description: 'My car engine is making strange noises',
            createdAt: now,
            updatedAt: now,
        });
        console.log('✅ Pending request created');

        // Accepted request
        await setDoc(doc(collection(db, 'requests')), {
            userId: TEST_CUSTOMER_UID,
            mechanicId: mechanic1Ref.id,
            userName: 'Test Customer',
            mechanicName: 'John Smith',
            serviceType: 'emergency',
            status: 'accepted',
            urgency: 'emergency',
            description: 'Car broke down on highway, need towing',
            createdAt: now,
            updatedAt: now,
        });
        console.log('✅ Accepted request created');

        // Completed request
        await setDoc(doc(collection(db, 'requests')), {
            userId: TEST_CUSTOMER_UID,
            mechanicId: mechanic1Ref.id,
            userName: 'Test Customer',
            mechanicName: 'John Smith',
            serviceType: 'car',
            status: 'completed',
            urgency: 'medium',
            description: 'Regular oil change and tire rotation',
            createdAt: now,
            updatedAt: now,
        });
        console.log('✅ Completed request created');

        console.log('🎉 Firestore seeding completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Create Firebase Auth users with these emails:');
        console.log('   - customer@test.com (password: test123)');
        console.log('   - mechanic@test.com (password: test123)');
        console.log('2. Update TEST_CUSTOMER_UID and TEST_MECHANIC_UID with real UIDs');
        console.log('3. Run this script again to link the data');
        console.log('4. Login with mechanic@test.com to test the dashboard');

    } catch (error) {
        console.error('❌ Error seeding Firestore:', error);
        throw error;
    }
};

// Uncomment to run automatically
// seedFirestoreData();

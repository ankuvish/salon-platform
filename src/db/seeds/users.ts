import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            email: 'sarah.johnson@salonowner.com',
            name: 'Sarah Johnson',
            role: 'owner',
            phone: '212-555-0101',
            preferences: null,
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            email: 'michael.chen@salonowner.com',
            name: 'Michael Chen',
            role: 'owner',
            phone: '310-555-0102',
            preferences: null,
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            email: 'emma.rodriguez@salonowner.com',
            name: 'Emma Rodriguez',
            role: 'owner',
            phone: '312-555-0103',
            preferences: null,
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            email: 'david.kim@salonowner.com',
            name: 'David Kim',
            role: 'owner',
            phone: '305-555-0104',
            preferences: null,
            createdAt: new Date('2024-02-10').toISOString(),
        },
        {
            email: 'lisa.taylor@salonowner.com',
            name: 'Lisa Taylor',
            role: 'owner',
            phone: '206-555-0105',
            preferences: null,
            createdAt: new Date('2024-02-15').toISOString(),
        },
        {
            email: 'amanda.wilson@email.com',
            name: 'Amanda Wilson',
            role: 'customer',
            phone: '415-555-0201',
            preferences: { favoriteServices: ['haircut', 'coloring'], preferredDays: ['Saturday', 'Sunday'] },
            createdAt: new Date('2024-08-10').toISOString(),
        },
        {
            email: 'james.martinez@email.com',
            name: 'James Martinez',
            role: 'customer',
            phone: '617-555-0202',
            preferences: { favoriteServices: ['haircut', 'beard trim'], preferredDays: ['Monday', 'Tuesday'] },
            createdAt: new Date('2024-08-15').toISOString(),
        },
        {
            email: 'olivia.anderson@email.com',
            name: 'Olivia Anderson',
            role: 'customer',
            phone: '213-555-0203',
            preferences: null,
            createdAt: new Date('2024-09-01').toISOString(),
        },
        {
            email: 'robert.thomas@email.com',
            name: 'Robert Thomas',
            role: 'customer',
            phone: '718-555-0204',
            preferences: { favoriteServices: ['massage', 'facial'], preferredDays: ['Friday', 'Saturday'] },
            createdAt: new Date('2024-09-05').toISOString(),
        },
        {
            email: 'sophia.garcia@email.com',
            name: 'Sophia Garcia',
            role: 'customer',
            phone: '312-555-0205',
            preferences: { favoriteServices: ['manicure', 'pedicure', 'coloring'], preferredDays: ['Wednesday', 'Thursday'] },
            createdAt: new Date('2024-09-12').toISOString(),
        },
        {
            email: 'daniel.lee@email.com',
            name: 'Daniel Lee',
            role: 'customer',
            phone: '858-555-0206',
            preferences: null,
            createdAt: new Date('2024-09-20').toISOString(),
        },
        {
            email: 'isabella.white@email.com',
            name: 'Isabella White',
            role: 'customer',
            phone: '503-555-0207',
            preferences: { favoriteServices: ['haircut', 'styling', 'highlights'], preferredDays: ['Saturday'] },
            createdAt: new Date('2024-10-01').toISOString(),
        },
        {
            email: 'matthew.harris@email.com',
            name: 'Matthew Harris',
            role: 'customer',
            phone: '214-555-0208',
            preferences: { favoriteServices: ['haircut'], preferredDays: ['Tuesday', 'Wednesday', 'Thursday'] },
            createdAt: new Date('2024-10-08').toISOString(),
        },
        {
            email: 'mia.clark@email.com',
            name: 'Mia Clark',
            role: 'customer',
            phone: '602-555-0209',
            preferences: null,
            createdAt: new Date('2024-10-15').toISOString(),
        },
        {
            email: 'christopher.lewis@email.com',
            name: 'Christopher Lewis',
            role: 'customer',
            phone: '407-555-0210',
            preferences: { favoriteServices: ['haircut', 'hot towel shave'], preferredDays: ['Monday', 'Friday'] },
            createdAt: new Date('2024-10-22').toISOString(),
        },
        {
            email: 'ava.robinson@email.com',
            name: 'Ava Robinson',
            role: 'customer',
            phone: '702-555-0211',
            preferences: { favoriteServices: ['balayage', 'deep conditioning'], preferredDays: ['Sunday'] },
            createdAt: new Date('2024-11-01').toISOString(),
        },
        {
            email: 'joshua.walker@email.com',
            name: 'Joshua Walker',
            role: 'customer',
            phone: '919-555-0212',
            preferences: null,
            createdAt: new Date('2024-11-08').toISOString(),
        },
        {
            email: 'emily.hall@email.com',
            name: 'Emily Hall',
            role: 'customer',
            phone: '510-555-0213',
            preferences: { favoriteServices: ['keratin treatment', 'blowout'], preferredDays: ['Friday', 'Saturday'] },
            createdAt: new Date('2024-11-15').toISOString(),
        },
        {
            email: 'andrew.young@email.com',
            name: 'Andrew Young',
            role: 'customer',
            phone: '303-555-0214',
            preferences: { favoriteServices: ['haircut'], preferredDays: ['Wednesday'] },
            createdAt: new Date('2024-11-22').toISOString(),
        },
        {
            email: 'charlotte.king@email.com',
            name: 'Charlotte King',
            role: 'customer',
            phone: '512-555-0215',
            preferences: { favoriteServices: ['coloring', 'haircut', 'styling'], preferredDays: ['Saturday', 'Sunday'] },
            createdAt: new Date('2024-12-01').toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
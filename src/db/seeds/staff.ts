import { db } from '@/db';
import { staff } from '@/db/schema';

async function main() {
    const sampleStaff = [
        {
            salonId: 14,
            name: 'Alex Martinez',
            specialization: 'Senior Stylist',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: 'Sophia Chen',
            specialization: 'Color Specialist',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: 'Ryan Patel',
            specialization: 'Hair Stylist',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: 'Emily Rodriguez',
            specialization: 'Nail Technician',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: 'Jordan Kim',
            specialization: 'Facial Expert',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(staff).values(sampleStaff);
    
    console.log('✅ Staff seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
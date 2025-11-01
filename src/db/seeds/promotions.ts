import { db } from '@/db';
import { promotions } from '@/db/schema';

async function main() {
    const samplePromotions = [
        {
            salonId: 1,
            title: 'New Year Special',
            description: '20% off all color services - Start your year with a fresh new look!',
            discountPercentage: 20,
            validFrom: new Date('2025-01-01').toISOString(),
            validUntil: new Date('2025-03-31').toISOString(),
            isActive: true,
            createdAt: new Date('2024-12-20').toISOString(),
        },
        {
            salonId: 3,
            title: 'Winter Wellness Package',
            description: '15% off facials and massage services - Perfect for cold weather skincare',
            discountPercentage: 15,
            validFrom: new Date('2025-01-05').toISOString(),
            validUntil: new Date('2025-02-28').toISOString(),
            isActive: true,
            createdAt: new Date('2024-12-28').toISOString(),
        },
        {
            salonId: 5,
            title: 'First Visit Discount',
            description: '25% off your first service - Welcome new clients!',
            discountPercentage: 25,
            validFrom: new Date('2025-01-01').toISOString(),
            validUntil: new Date('2025-12-31').toISOString(),
            isActive: true,
            createdAt: new Date('2024-12-15').toISOString(),
        },
        {
            salonId: 2,
            title: 'Manicure Monday',
            description: '10% off all manicures and pedicures every Monday',
            discountPercentage: 10,
            validFrom: new Date('2025-01-06').toISOString(),
            validUntil: new Date('2025-06-30').toISOString(),
            isActive: true,
            createdAt: new Date('2025-01-02').toISOString(),
        },
        {
            salonId: 7,
            title: 'Haircut Happy Hour',
            description: '30% off weekday haircuts before 2 PM - Beat the rush!',
            discountPercentage: 30,
            validFrom: new Date('2025-01-10').toISOString(),
            validUntil: new Date('2025-04-30').toISOString(),
            isActive: true,
            createdAt: new Date('2025-01-05').toISOString(),
        },
        {
            salonId: 4,
            title: 'Student Special',
            description: '20% off all services with valid student ID',
            discountPercentage: 20,
            validFrom: new Date('2025-01-15').toISOString(),
            validUntil: new Date('2025-08-31').toISOString(),
            isActive: true,
            createdAt: new Date('2025-01-10').toISOString(),
        },
        {
            salonId: 9,
            title: 'Spring Refresh',
            description: '15% off all styling services - Get ready for spring!',
            discountPercentage: 15,
            validFrom: new Date('2025-01-20').toISOString(),
            validUntil: new Date('2025-05-31').toISOString(),
            isActive: true,
            createdAt: new Date('2025-01-15').toISOString(),
        },
        {
            salonId: 6,
            title: 'Referral Reward',
            description: '20% off when you refer a friend who books their first appointment',
            discountPercentage: 20,
            validFrom: new Date('2025-01-01').toISOString(),
            validUntil: new Date('2025-12-31').toISOString(),
            isActive: true,
            createdAt: new Date('2024-12-25').toISOString(),
        },
    ];

    await db.insert(promotions).values(samplePromotions);
    
    console.log('✅ Promotions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
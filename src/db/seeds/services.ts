import { db } from '@/db';
import { services } from '@/db/schema';

async function main() {
    const sampleServices = [
        {
            salonId: 14,
            name: "Men's Haircut",
            description: "Professional men's haircut with wash and style. Our experienced stylists will give you a clean, modern look.",
            price: 25.00,
            durationMinutes: 30,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Women's Haircut",
            description: "Expert women's haircut with consultation, precision cutting, and blow dry. Tailored to your face shape and style.",
            price: 45.00,
            durationMinutes: 45,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Kids Haircut",
            description: "Fun and gentle haircut for children under 12. Patient stylists make it a comfortable experience.",
            price: 20.00,
            durationMinutes: 25,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Hair Color",
            description: "Full hair color service with premium products. Includes consultation, application, and style.",
            price: 80.00,
            durationMinutes: 90,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Highlights",
            description: "Foil highlights for dimension and brightness. Includes toner and finishing style.",
            price: 100.00,
            durationMinutes: 120,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Balayage",
            description: "Hand-painted highlighting technique for natural, sun-kissed look. Low maintenance and seamless.",
            price: 150.00,
            durationMinutes: 150,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Deep Conditioning",
            description: "Intensive moisturizing treatment for damaged or dry hair. Restores shine and softness.",
            price: 40.00,
            durationMinutes: 45,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Keratin Treatment",
            description: "Professional smoothing treatment that eliminates frizz and adds shine. Lasts up to 3 months.",
            price: 200.00,
            durationMinutes: 180,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Hair Spa",
            description: "Relaxing hair spa treatment with scalp massage, deep conditioning, and steam therapy.",
            price: 60.00,
            durationMinutes: 60,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Blow Dry",
            description: "Professional blow dry with premium products for salon-perfect hair. Includes styling.",
            price: 30.00,
            durationMinutes: 30,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Hair Styling",
            description: "Special occasion hair styling for events, parties, or photoshoots. Creative and elegant.",
            price: 50.00,
            durationMinutes: 45,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Bridal Hair",
            description: "Complete bridal hair package including trial, wedding day styling, and touch-up kit.",
            price: 250.00,
            durationMinutes: 120,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Beard Trim",
            description: "Professional beard trimming and shaping with hot towel treatment.",
            price: 15.00,
            durationMinutes: 20,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Beard Styling",
            description: "Complete beard grooming with trim, shaping, and premium beard oil application.",
            price: 25.00,
            durationMinutes: 30,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Basic Facial",
            description: "Deep cleansing facial with exfoliation, massage, and hydrating mask. Perfect for all skin types.",
            price: 50.00,
            durationMinutes: 45,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Deluxe Facial",
            description: "Luxurious facial treatment with extractions, serum application, and anti-aging massage.",
            price: 80.00,
            durationMinutes: 60,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Anti-Aging Facial",
            description: "Advanced anti-aging facial with collagen boost, LED therapy, and lifting massage.",
            price: 120.00,
            durationMinutes: 75,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Manicure",
            description: "Professional manicure with nail shaping, cuticle care, hand massage, and polish.",
            price: 35.00,
            durationMinutes: 40,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Pedicure",
            description: "Relaxing pedicure with foot soak, exfoliation, massage, and polish application.",
            price: 45.00,
            durationMinutes: 50,
            createdAt: new Date().toISOString(),
        },
        {
            salonId: 14,
            name: "Mani-Pedi Combo",
            description: "Complete nail care package combining manicure and pedicure services at a special rate.",
            price: 70.00,
            durationMinutes: 90,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(services).values(sampleServices);
    
    console.log('✅ Services seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
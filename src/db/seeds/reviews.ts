import { db } from '@/db';
import { reviews } from '@/db/schema';

async function main() {
    const customerIds = [
        'user_01h4kxt2e8z9y3b1n7m6q5w8r4',
        'user_01h4kxt2e8z9y3b1n7m6q5w8r5',
        'user_01h4kxt2e8z9y3b1n7m6q5w8r6',
        'user_01h4kxt2e8z9y3b1n7m6q5w8r7',
        'user_01h4kxt2e8z9y3b1n7m6q5w8r8',
        'user_01h4kxt2e8z9y3b1n7m6q5w8r9',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r0',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r1',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r2',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r3',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r4',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r5',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r6',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r7',
        'user_01h4kxt2e8z9y3b1n7m6q5w9r8',
    ];

    const sampleReviews = [
        {
            salonId: 1,
            customerId: customerIds[0],
            bookingId: 1,
            rating: 5,
            comment: 'Absolutely fantastic experience! The staff was incredibly professional and the haircut exceeded my expectations. The salon ambiance was relaxing and clean. Will definitely be back!',
            createdAt: new Date('2024-03-16T15:30:00').toISOString(),
        },
        {
            salonId: 2,
            customerId: customerIds[1],
            bookingId: 3,
            rating: 5,
            comment: 'Best salon in town! My stylist really understood what I wanted and delivered perfectly. The products they use are top quality. Highly recommend!',
            createdAt: new Date('2024-03-17T11:00:00').toISOString(),
        },
        {
            salonId: 3,
            customerId: customerIds[2],
            bookingId: 5,
            rating: 4,
            comment: 'Great service overall. The haircut was good and the staff was friendly. Only minor issue was the wait time being slightly longer than expected, but worth it.',
            createdAt: new Date('2024-03-18T14:20:00').toISOString(),
        },
        {
            salonId: 4,
            customerId: customerIds[3],
            bookingId: 7,
            rating: 5,
            comment: 'Amazing facial treatment! My skin feels so refreshed and glowing. The aesthetician was knowledgeable and gentle. The products used were excellent quality.',
            createdAt: new Date('2024-03-19T16:45:00').toISOString(),
        },
        {
            salonId: 5,
            customerId: customerIds[4],
            bookingId: 9,
            rating: 5,
            comment: 'Wonderful experience from start to finish. The stylist took time to understand my preferences and gave valuable suggestions. Very happy with the result!',
            createdAt: new Date('2024-03-20T10:30:00').toISOString(),
        },
        {
            salonId: 1,
            customerId: customerIds[5],
            bookingId: 11,
            rating: 3,
            comment: 'The service was okay but not exceptional. The haircut was decent but I expected more attention to detail for the price. The salon itself is nice though.',
            createdAt: new Date('2024-03-21T13:15:00').toISOString(),
        },
        {
            salonId: 6,
            customerId: customerIds[6],
            bookingId: 13,
            rating: 5,
            comment: 'Outstanding service! The manicure and pedicure were perfectly done. Very hygienic environment and the staff was extremely courteous. Will definitely return!',
            createdAt: new Date('2024-03-22T15:00:00').toISOString(),
        },
        {
            salonId: 7,
            customerId: customerIds[7],
            bookingId: 15,
            rating: 4,
            comment: 'Good experience overall. The massage was relaxing and professional. The only improvement would be better appointment scheduling to avoid overlap.',
            createdAt: new Date('2024-03-23T12:30:00').toISOString(),
        },
        {
            salonId: 8,
            customerId: customerIds[8],
            bookingId: 17,
            rating: 5,
            comment: 'Excellent hair coloring service! The color came out exactly as I wanted. The stylist was patient and made sure I was comfortable throughout. Love my new look!',
            createdAt: new Date('2024-03-24T14:00:00').toISOString(),
        },
        {
            salonId: 9,
            customerId: customerIds[9],
            bookingId: 19,
            rating: 5,
            comment: 'Perfect bridal makeup! The makeup artist was talented and understood my vision completely. I looked and felt beautiful on my special day. Thank you so much!',
            createdAt: new Date('2024-03-25T16:20:00').toISOString(),
        },
        {
            salonId: 10,
            customerId: customerIds[10],
            bookingId: 21,
            rating: 4,
            comment: 'Very pleased with the beard grooming service. The barber was skilled and professional. Comfortable atmosphere and good value for money.',
            createdAt: new Date('2024-03-26T11:45:00').toISOString(),
        },
        {
            salonId: 2,
            customerId: customerIds[11],
            bookingId: 23,
            rating: 5,
            comment: 'Exceptional service! The hair spa treatment was incredibly relaxing and my hair feels so much healthier. The staff was attentive and knowledgeable.',
            createdAt: new Date('2024-03-27T13:30:00').toISOString(),
        },
        {
            salonId: 3,
            customerId: customerIds[12],
            bookingId: 25,
            rating: 5,
            comment: 'Best waxing experience ever! Quick, professional, and almost painless. The beautician was experienced and made me feel comfortable throughout.',
            createdAt: new Date('2024-03-28T10:15:00').toISOString(),
        },
        {
            salonId: 4,
            customerId: customerIds[13],
            bookingId: 27,
            rating: 4,
            comment: 'Good haircut and styling. The stylist listened to what I wanted and delivered well. Clean salon with pleasant ambiance. Would visit again.',
            createdAt: new Date('2024-03-29T15:30:00').toISOString(),
        },
        {
            salonId: 5,
            customerId: customerIds[14],
            bookingId: 29,
            rating: 5,
            comment: 'Superb hair treatment service! My damaged hair has significantly improved after the keratin treatment. The stylist explained everything clearly. Highly satisfied!',
            createdAt: new Date('2024-03-30T12:00:00').toISOString(),
        },
        {
            salonId: 6,
            customerId: customerIds[0],
            bookingId: 31,
            rating: 3,
            comment: 'Average experience. The service was fine but nothing special. The pricing seemed a bit high for what was offered. Might try other places next time.',
            createdAt: new Date('2024-03-31T14:45:00').toISOString(),
        },
        {
            salonId: 7,
            customerId: customerIds[1],
            bookingId: 33,
            rating: 5,
            comment: 'Amazing threading service! Very precise and professional. The beautician was gentle and the results were perfect. Will definitely come back for future appointments.',
            createdAt: new Date('2024-04-01T11:30:00').toISOString(),
        },
        {
            salonId: 8,
            customerId: customerIds[2],
            bookingId: 35,
            rating: 4,
            comment: 'Really good hair styling for the event I attended. The stylist was creative and accommodating to my requests. The hairstyle lasted the entire evening perfectly.',
            createdAt: new Date('2024-04-02T16:00:00').toISOString(),
        },
        {
            salonId: 9,
            customerId: customerIds[3],
            bookingId: 37,
            rating: 5,
            comment: 'Phenomenal party makeup! The makeup artist is truly talented. I received so many compliments. The products used were high quality and long-lasting. Thank you!',
            createdAt: new Date('2024-04-03T13:15:00').toISOString(),
        },
        {
            salonId: 10,
            customerId: customerIds[4],
            bookingId: 39,
            rating: 4,
            comment: 'Solid haircut service. The barber was skilled and friendly. Clean equipment and hygienic practices. Good overall experience with reasonable pricing.',
            createdAt: new Date('2024-04-04T10:45:00').toISOString(),
        },
    ];

    await db.insert(reviews).values(sampleReviews);
    
    console.log('✅ Reviews seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});
db = db.getSiblingDB('salonbook');

db.createUser({
  user: 'salonbook_user',
  pwd: 'salonbook_password',
  roles: [
    {
      role: 'readWrite',
      db: 'salonbook',
    },
  ],
});

db.createCollection('users');
db.createCollection('salons');
db.createCollection('services');
db.createCollection('staff');
db.createCollection('bookings');
db.createCollection('reviews');
db.createCollection('promotions');

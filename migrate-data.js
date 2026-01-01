const { MongoClient } = require('mongodb');

const atlasUri = 'mongodb+srv://sharmakv888_db_user:Anand%40123123@cluster0.m2zvcuc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const localUri = 'mongodb://salonbook_user:salonbook_password@localhost:27017/salonbook?authSource=salonbook';

const collections = ['users', 'salons', 'services', 'staff', 'bookings', 'reviews', 'promotions'];

async function migrateData() {
  let atlasClient, localClient;
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    atlasClient = await MongoClient.connect(atlasUri);
    const atlasDb = atlasClient.db();
    
    console.log('Connecting to local MongoDB...');
    localClient = await MongoClient.connect(localUri);
    const localDb = localClient.db('salonbook');
    
    for (const collectionName of collections) {
      console.log(`\nMigrating ${collectionName}...`);
      
      const atlasCollection = atlasDb.collection(collectionName);
      const documents = await atlasCollection.find({}).toArray();
      
      if (documents.length > 0) {
        const localCollection = localDb.collection(collectionName);
        await localCollection.deleteMany({});
        await localCollection.insertMany(documents);
        console.log(`✓ Migrated ${documents.length} documents from ${collectionName}`);
      } else {
        console.log(`- No documents in ${collectionName}`);
      }
    }
    
    console.log('\n✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (atlasClient) await atlasClient.close();
    if (localClient) await localClient.close();
  }
}

migrateData();

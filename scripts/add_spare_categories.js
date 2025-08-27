// Script to add spare categories to MongoDB
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

const categories = [
  'زيت الماتور',
  'زيت الفتيس',
  'فلتر الهواء',
  'قلب طلمبة البنزين',
  'فلتر زيت',
  'فلتر تكييف',
  'فلتر زيت فتيس',
  'ماء تبريد',
  'بوجيهات',
  'فلتر بنزين',
  'حشو فلتر زيت',
  'موبينة',
  'مواسير و اخري'
];

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('spare_categories');
    for (const name of categories) {
      await collection.updateOne(
        { name },
        { $set: { name } },
        { upsert: true }
      );
    }
    console.log('تمت إضافة الأقسام بنجاح');
  } finally {
    await client.close();
  }
}

run();

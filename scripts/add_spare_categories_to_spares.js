// Script to add category field to spares in MongoDB
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || '';
const client = new MongoClient(uri);

const categoryMap = {
  'زيت الماتور': 'زيوت',
  'زيت الفتيس': 'زيوت',
  'فلتر الهواء': 'فلاتر',
  'قلب طلمبة البنزين': 'طلمبات',
  'فلتر زيت': 'فلاتر',
  'فلتر تكييف': 'فلاتر',
  'فلتر زيت فتيس': 'فلاتر',
  'ماء تبريد': 'سوائل',
  'بوجيهات': 'كهرباء',
  'فلتر بنزين': 'فلاتر',
  'حشو فلتر زيت': 'فلاتر'
};

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('spares');
    for (const [name, category] of Object.entries(categoryMap)) {
      await collection.updateMany(
        { name },
        { $set: { category } }
      );
    }
    console.log('تم تحديث الأقسام في قطع الغيار بنجاح');
  } finally {
    await client.close();
  }
}

run();

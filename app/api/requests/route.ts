import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const requests = await db.collection('requests').find({}).sort({createdAt: -1}).toArray();
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const ins = await db.collection('requests').insertOne({
    customerName: body.customerName,
    phone: body.phone,
    carType: body.carType,
    carModel: body.carModel,
    carNumber: body.carNumber,
    kilometers: body.kilometers,
    problem: body.problem,
    notes: body.notes || '',
    repairCost: body.repairCost || '',
    usedSpares: Array.isArray(body.usedSpares) ? body.usedSpares : [],
    total: body.total || '',
    status: 'جديد',
    createdAt: Date.now()
  });
  return NextResponse.json({ success: true, id: ins.insertedId });
}

// PATCH: تحديث طلب أو حالة
export async function PATCH(req: NextRequest) {
  const { id, ...updateFields } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection('requests').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
  return NextResponse.json({ success: true });
}

// DELETE: حذف طلب مع إعادة القطع للمخزن
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  // استرجاع الطلب أولاً
  const reqDoc = await db.collection('requests').findOne({ _id: new ObjectId(id) });
  if (reqDoc && Array.isArray(reqDoc.usedSpares)) {
    for (const us of reqDoc.usedSpares) {
      if (us.id && us.qty) {
        const spare = await db.collection('spares').findOne({ _id: new ObjectId(us.id) });
        if (spare) {
          await db.collection('spares').updateOne(
            { _id: new ObjectId(us.id) },
            { $inc: { quantity: us.qty } }
          );
        }
      }
    }
  }
  await db.collection('requests').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: كل قطع الغيار
export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const spares = await db.collection('spares').find({}).sort({name: 1}).toArray();
  return NextResponse.json(spares);
}

// POST: إضافة قطعة جديدة
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.price) {
    return NextResponse.json({ error: 'حقل الاسم والسعر إجباري' }, { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db();
  const ins = await db.collection('spares').insertOne({
    name: body.name,
    price: parseFloat(body.price) || 0,
    quantity: parseInt(body.quantity) || 0,
    category: body.category || "",
    createdAt: Date.now()
  });
  return NextResponse.json({ success: true, id: ins.insertedId });
}

// PATCH: تحديث كمية أو بيانات قطعة
export async function PATCH(req: NextRequest) {
  const { id, ...updateFields } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection('spares').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields }
  );
  return NextResponse.json({ success: true });
}

// DELETE: حذف قطعة
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection('spares').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

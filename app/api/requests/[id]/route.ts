import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await Promise.resolve(context.params) as { id: string };
  const { id } = params;
  const body = await request.json();
  // حذف _id من الجسم قبل التحديث
  if ('_id' in body) {
    delete body._id;
  }
  const client = await clientPromise;
  const db = client.db();
  await db.collection('requests').updateOne(
    { _id: new ObjectId(id) },
    { $set: body }
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const params = await Promise.resolve(context.params) as { id: string };
  const { id } = params;
  const client = await clientPromise;
  const db = client.db();
  await db.collection('requests').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

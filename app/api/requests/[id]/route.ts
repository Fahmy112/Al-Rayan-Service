import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const body = await request.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection('requests').updateOne(
    { _id: new ObjectId(id) },
    { $set: body }
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const client = await clientPromise;
  const db = client.db();
  await db.collection('requests').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

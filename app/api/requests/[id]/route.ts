import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db();
  await db.collection('requests').updateOne(
    { _id: new ObjectId(id) },
    { $set: body }
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const client = await clientPromise;
  const db = client.db();
  await db.collection('requests').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

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
    // الحقول الاختيارية:
    notes: body.notes || '',
    repairCost: body.repairCost || '',
    sparePartName: body.sparePartName || '',
    sparePartPrice: body.sparePartPrice || '',
    total: body.total || '',
    status: 'جديد',
    createdAt: Date.now()
  });
  return NextResponse.json({ success: true, id: ins.insertedId });
}

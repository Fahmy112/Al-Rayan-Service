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
  phone2: body.phone2 || '',
  carType: body.carType,
    carModel: body.carModel,
    carNumber: body.carNumber,
    kilometers: body.kilometers,
    problem: body.problem,
    notes: body.notes || '',
    repairCost: body.repairCost || '',
    purchasesCost: body.purchasesCost || '',
    purchasesRkha: body.purchasesRkha || '',
    purchasesFady: body.purchasesFady || '',
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
  // دعم كل الأنواع (الجديدة: usedSpares - القديمة: sparePartId/sparePartName)
  if (reqDoc) {
    // حالة الطلبات الحديثة (usedSpares)
    if (Array.isArray(reqDoc.usedSpares)) {
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
    } else if (reqDoc.sparePartId && reqDoc.sparePartName) {
      // حالة الطلبات القديمة: استرجاع 1 qty فقط لو كان الطلب له قطع غيار مرتبطة
      const spare = await db.collection('spares').findOne({ _id: new ObjectId(reqDoc.sparePartId) });
      if (spare) {
        await db.collection('spares').updateOne(
          { _id: new ObjectId(reqDoc.sparePartId) },
          { $inc: { quantity: 1 } }
        );
      }
    }
  }
  await db.collection('requests').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";

export function middleware() {
	// Middleware فارغ لتجنب خطأ البناء
	return NextResponse.next();
}

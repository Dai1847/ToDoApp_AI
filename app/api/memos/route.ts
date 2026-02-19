import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { content } = await req.json();
        const memo = await prisma.memo.create({
            data: {
                userId: (session.user as any).id,
                content,
            },
        });
        return NextResponse.json(memo, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: "Error creating memo" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const memos = await prisma.memo.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(memos);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching memos" }, { status: 500 });
    }
}

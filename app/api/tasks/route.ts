import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    try {
        const { title, description, dueDate, category, priority, checklist } = await req.json();

        if (!title) {
            return NextResponse.json({ message: "タイトルは必須です" }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                userId: (session.user as any).id,
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                category,
                priority: priority || "medium",
                status: "todo",
                checklist: {
                    create: checklist?.map((item: { title: string }) => ({
                        title: item.title,
                        isDone: false,
                    })) || [],
                },
            },
            include: {
                checklist: true,
            },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Task creation error:", error);
        return NextResponse.json({ message: "タスクの作成に失敗しました" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const view = searchParams.get("view"); // daily, weekly, monthly

    const where: any = { userId: (session.user as any).id };
    if (status) where.status = status;

    // Add date filtering for views if needed...

    try {
        const tasks = await prisma.task.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: { checklist: true }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        return NextResponse.json({ message: "タスクの取得に失敗しました" }, { status: 500 });
    }
}

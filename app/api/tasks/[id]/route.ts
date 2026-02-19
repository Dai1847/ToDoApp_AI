import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "認証が必要です" }, { status: 401 });

    try {
        const { status, title, description, checklist } = await req.json();

        // Verify ownership
        const existingTask = await prisma.task.findUnique({
            where: { id: params.id },
        });

        if (!existingTask || existingTask.userId !== (session.user as any).id) {
            return NextResponse.json({ message: "権限がありません" }, { status: 403 });
        }

        const updatedTask = await prisma.task.update({
            where: { id: params.id },
            data: {
                status,
                title,
                description,
                checklist: checklist ? {
                    deleteMany: {},
                    create: checklist.map((item: { title: string, isDone: boolean }) => ({
                        title: item.title,
                        isDone: item.isDone,
                    })),
                } : undefined,
            },
            include: { checklist: true },
        });

        return NextResponse.json(updatedTask);
    } catch (error) {
        return NextResponse.json({ message: "更新に失敗しました" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "認証が必要です" }, { status: 401 });

    try {
        await prisma.task.delete({
            where: {
                id: params.id,
                userId: (session.user as any).id
            },
        });
        return NextResponse.json({ message: "削除しました" });
    } catch (error) {
        return NextResponse.json({ message: "削除に失敗しました" }, { status: 500 });
    }
}

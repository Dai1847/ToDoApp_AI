import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  StickyNote,
  Calendar,
  LayoutTemplate,
  ChevronRight
} from "lucide-react";


async function getStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalTasks, completedTasks, upcomingTasks, recentMemos] = await Promise.all([
    prisma.task.count({ where: { userId, createdAt: { gte: today } } }),
    prisma.task.count({ where: { userId, status: "completed", updatedAt: { gte: today } } }),
    prisma.task.findMany({
      where: { userId, status: { not: "completed" } },
      orderBy: { dueDate: 'asc' },
      take: 5
    }),
    prisma.memo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  ]);

  const progressRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return { totalTasks, completedTasks, progressRate, upcomingTasks, recentMemos };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>ログインが必要です</div>;
  }

  const stats = await getStats(session.user.id);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="opacity-70 mt-1">こんにちは、今日の状況を確認しましょう。</p>
        </div>
        <div className="flex gap-3">
          <Link href="/tasks/new" className="glass-button flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium">
            <Plus size={18} />
            新規タスク
          </Link>
          <Link href="/memos/new" className="glass-button flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium">
            <StickyNote size={18} />
            メモ
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-500">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70">今日のタスク</p>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="rounded-full bg-green-500/10 p-3 text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70">完了済み</p>
            <p className="text-2xl font-bold">{stats.completedTasks}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="rounded-full bg-orange-500/10 p-3 text-orange-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm opacity-70">進捗率</p>
            <p className="text-2xl font-bold">{stats.progressRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Tasks */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-indigo-500" />
              期限の近いタスク
            </h2>
            <Link href="/tasks" className="text-sm text-indigo-500 hover:underline flex items-center gap-1">
              すべて見る <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingTasks.length > 0 ? (
              stats.upcomingTasks.map((task: any) => (
                <div key={task.id} className="glass-card p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-xs opacity-60">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '期限なし'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/tasks/${task.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded-full">
                    <ChevronRight size={20} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="glass-card p-12 text-center opacity-50 italic">
                予定されているタスクはありません。
              </div>
            )}
          </div>
        </section>

        {/* Sidebar: Memos & Templates */}
        <aside className="space-y-8">
          {/* Quick Access */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus className="text-indigo-500" />
              クイックアクセス
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/tasks?view=daily" className="glass-card p-4 text-center hover:bg-indigo-500/5 transition-colors">
                <Calendar className="mx-auto mb-2 opacity-70" />
                <span className="text-xs font-medium">日次</span>
              </Link>
              <Link href="/tasks?view=weekly" className="glass-card p-4 text-center hover:bg-indigo-500/5 transition-colors">
                <LayoutTemplate className="mx-auto mb-2 opacity-70" />
                <span className="text-xs font-medium">週次</span>
              </Link>
            </div>
          </section>

          {/* Recent Memos */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <StickyNote className="text-indigo-500" />
              最新のメモ
            </h2>
            <div className="space-y-3">
              {stats.recentMemos.map((memo: any) => (
                <Link key={memo.id} href={`/memos/${memo.id}`} className="glass-card p-4 block hover:bg-white/5 transition-colors">
                  <p className="text-sm line-clamp-2">{memo.content}</p>
                  <p className="text-[10px] opacity-40 mt-2">
                    {new Date(memo.createdAt).toLocaleString()}
                  </p>
                </Link>
              ))}
              <Link href="/memos" className="block text-center text-xs text-indigo-500 hover:underline">
                すべてのメモを見る
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Calendar as CalendarIcon, Tag, AlertTriangle } from "lucide-react";

export default function NewTaskPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("medium");
    const [checklist, setChecklist] = useState<{ title: string }[]>([]);
    const [newCheckItem, setNewCheckItem] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const addCheckItem = () => {
        if (!newCheckItem.trim()) return;
        setChecklist([...checklist, { title: newCheckItem.trim() }]);
        setNewCheckItem("");
    };

    const removeCheckItem = (index: number) => {
        setChecklist(checklist.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    dueDate,
                    category,
                    priority,
                    checklist,
                }),
            });

            if (res.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4 md:p-8">
            <div className="glass-card p-8">
                <h1 className="text-2xl font-bold mb-6">新規タスク作成</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">タスク名</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-3 focus:border-indigo-500/50 focus:outline-none"
                            placeholder="何を行いますか？"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">詳細（任意）</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-3 h-24 focus:border-indigo-500/50 focus:outline-none"
                            placeholder="詳細を記入してください"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <CalendarIcon size={14} /> 期限
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 focus:border-indigo-500/50 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Tag size={14} /> カテゴリ
                            </label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg bg-white/5 border border-white/10 p-3 focus:border-indigo-500/50 focus:outline-none"
                                placeholder="例: 仕事、個人、買い物"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle size={14} /> 優先度
                        </label>
                        <div className="flex gap-4">
                            {['low', 'medium', 'high'].map((p) => (
                                <label key={p} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={p}
                                        checked={priority === p}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="accent-indigo-500"
                                    />
                                    <span className="text-sm capitalize">{p}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Checklist Area */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">チェックリスト（サブタスク）</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCheckItem}
                                onChange={(e) => setNewCheckItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCheckItem())}
                                className="flex-1 rounded-lg bg-white/5 border border-white/10 p-2 text-sm focus:border-indigo-500/50 focus:outline-none"
                                placeholder="項目を追加..."
                            />
                            <button
                                type="button"
                                onClick={addCheckItem}
                                className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {checklist.map((item, index) => (
                                <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                                    <span className="text-sm">{item.title}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeCheckItem(index)}
                                        className="text-red-500/50 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "作成中..." : "保存する"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

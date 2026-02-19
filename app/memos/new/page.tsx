"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMemoPage() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        try {
            const res = await fetch("/api/memos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
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
        <div className="mx-auto max-w-2xl p-4 md:p-8 text-white">
            <div className="glass-card p-8">
                <h1 className="text-2xl font-bold mb-6">新規メモ作成</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full rounded-lg bg-white/5 border border-white/10 p-4 h-64 focus:border-indigo-500/50 focus:outline-none resize-none"
                        placeholder="思いついたことを自由に書き留めてください..."
                        required
                    />
                    <div className="flex gap-4">
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
                            className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "保存中..." : "保存する"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

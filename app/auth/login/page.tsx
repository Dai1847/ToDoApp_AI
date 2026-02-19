"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("予期せぬエラーが発生しました。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
                <h1 className="mb-6 text-center text-3xl font-bold tracking-tight">Login</h1>
                <p className="mb-8 text-center text-sm opacity-70">
                    おかえりなさい！ToDoアプリにログインしてください。
                </p>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-500/20 p-3 text-sm text-red-500 border border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-3 transition focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            placeholder="example@mail.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg bg-white/5 border border-white/10 p-3 transition focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="glass-button w-full rounded-lg py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--accent)' }}
                    >
                        {loading ? "ログイン中..." : "ログイン"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm opacity-70">
                    アカウントをお持ちでないですか？{" "}
                    <Link href="/auth/register" className="font-semibold text-indigo-500 hover:underline">
                        新規登録
                    </Link>
                </p>
            </div>
        </div>
    );
}

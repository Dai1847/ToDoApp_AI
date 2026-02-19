import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/auth/login",
    },
});

export const config = {
    matcher: [
        "/",
        "/tasks/:path*",
        "/memos/:path*",
        "/templates/:path*",
        "/api/tasks/:path*",
        "/api/memos/:path*",
    ],
};

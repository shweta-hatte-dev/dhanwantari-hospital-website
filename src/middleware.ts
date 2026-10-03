export { default } from "next-auth/middleware";

// Every route under /dashboard requires a signed-in user.
// Role-specific checks happen inside each page via requireRole().
export const config = { matcher: ["/dashboard/:path*"] };

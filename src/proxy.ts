import { NextRequest, NextResponse } from "next/server";

function isAdminHost(host: string) {
  const hostname = host.split(":")[0].toLowerCase();
  const configured = process.env.ADMIN_HOST?.split(":")[0].toLowerCase();
  return hostname === configured || hostname.startsWith("admin.");
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const url = request.nextUrl.clone();
  const adminRequest = isAdminHost(host);
  const shouldRewrite =
    adminRequest &&
    !url.pathname.startsWith("/admin") &&
    !url.pathname.startsWith("/api");

  if (!adminRequest && url.pathname.startsWith("/admin") && process.env.NEXT_PUBLIC_ADMIN_URL) {
    const publicPath = url.pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(new URL(publicPath + url.search, process.env.NEXT_PUBLIC_ADMIN_URL));
  }

  if (shouldRewrite) url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;

  return shouldRewrite
    ? NextResponse.rewrite(url)
    : NextResponse.next({ request: { headers: request.headers } });

}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

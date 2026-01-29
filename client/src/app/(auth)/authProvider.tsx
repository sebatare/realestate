"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(login|auth)/) || pathname === "/login";
  const isDashboardPage =
    pathname.startsWith("/managers") || pathname.startsWith("/tenants");
  const isPublicPage = !isAuthPage && !isDashboardPage;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // If user is logged in and trying to access auth page, redirect to dashboard
    if (token && user && isAuthPage) {
      const userData = JSON.parse(user);
      const redirectUrl =
        userData.role === "manager"
          ? "/managers/properties"
          : "/tenants/residences";
      router.push(redirectUrl);
    }

    // If user is NOT logged in and trying to access dashboard, redirect to login
    if (!token && isDashboardPage) {
      router.push("/login");
    }
  }, [pathname, router, isAuthPage, isDashboardPage]);

  // Allow public pages without authentication
  if (isPublicPage) {
    return <>{children}</>;
  }

  return <>{children}</>;
};
export default Auth;

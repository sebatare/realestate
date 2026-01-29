"use client";
import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAuthUser } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { data: authUser, isLoading: authLoading } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if (userRole === "manager" && pathname.startsWith("/search")) {
        // Redirigir managers a su dashboard sin esperar más
        router.push("/managers/properties", { scroll: false });
        return;
      }
      if (userRole === "manager" && pathname === "/") {
        router.push("/managers/properties", { scroll: false });
        return;
      }
    }

    // Solo para tenants o usuarios sin autenticación
    setIsLoading(false);
  }, [authUser, authLoading, router, pathname]);

  if (authLoading || isLoading) return <>Loading...</>;

  return (
    <div className="h-full w-full">
      <Navbar />
      <main
        className={`h-full flex w-full flex-col`}
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;

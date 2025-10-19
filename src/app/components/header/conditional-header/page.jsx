"use client";

import { usePathname } from "next/navigation";
import Header from "./page";

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  if (pathname.startsWith('/deliver') || pathname.startsWith('/warehouse')) {
    return null;
  }
  
  return <Header />;
}
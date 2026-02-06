"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "@/src/components/vc-os/Home";

export default function VCOS() {
  const router = useRouter();
  const [view, setView] = useState<"home" | "app">("home");

  if (view === "home") {
    return (
      <Home
        onEnterApp={() => setView("app")}
        onSelectTool={(toolId) => {
          if (toolId === "01") {
            router.push("/diligence");
          }
        }}
      />
    );
  }
  return <></>;
}

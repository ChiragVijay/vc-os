"use client";

import { useRouter } from "next/navigation";
import { Home } from "@/src/components/vc-os/Home";

export default function VCOS() {
  const router = useRouter();

  return (
    <Home
      onEnterApp={() => router.push("/dashboard")}
      onSelectTool={(toolId) => {
        if (toolId === "01") router.push("/diligence");
        if (toolId === "02") router.push("/dashboard");
        if (toolId === "03") router.push("/founder");
        if (toolId === "04") router.push("/cap-table");
      }}
    />
  );
}

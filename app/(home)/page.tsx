"use client";

import { useRouter } from "next/navigation";
import { Home } from "@/src/components/vc-os";

export default function HomePage() {
  const router = useRouter();

  return (
    <Home
      onEnterApp={() => router.push("/app")}
      onSelectTool={(toolId) => {
        if (toolId === "01") {
          router.push("/diligence");
        }
      }}
    />
  );
}

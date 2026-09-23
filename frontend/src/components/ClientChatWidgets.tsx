"use client";

import dynamic from "next/dynamic";

const FloatingChat = dynamic(() => import("@/components/FloatingChat"), { ssr: false });
const AIAssistantChat = dynamic(
  () => import("@/components/ui/AIAssistantChat").then((m) => m.AIAssistantChat),
  { ssr: false }
);

export default function ClientChatWidgets() {
  return (
    <>
      <FloatingChat />
      <AIAssistantChat />
    </>
  );
}

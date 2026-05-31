"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BecomeInstructorRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/become-instructor");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 font-semibold">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}

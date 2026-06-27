"use client";

import { signIn } from "next-auth/react";
import { GoogleIcon } from "@/components/icons";

export function SignInButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      onClick={() => signIn("google", { callbackUrl: "/taller" })}
      className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-edge bg-bone px-6 py-3.5 font-display text-sm font-semibold text-abyss transition-transform hover:-translate-y-px hover:shadow-lg hover:shadow-black/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      <GoogleIcon />
      {label}
    </button>
  );
}

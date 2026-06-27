import type { NextRequest } from "next/server";
import { handlers } from "@/auth";

function missingAuthSecretResponse() {
  if (process.env.NODE_ENV !== "production" || process.env.AUTH_SECRET) return null;
  return Response.json(
    { error: "AUTH_SECRET is required in production" },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  return missingAuthSecretResponse() ?? handlers.GET(request);
}

export async function POST(request: NextRequest) {
  return missingAuthSecretResponse() ?? handlers.POST(request);
}

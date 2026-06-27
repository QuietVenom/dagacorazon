import { getResourcesResponse } from "@/lib/resources";
import { isBrewType, isResourceLanguage } from "@/lib/resource-types";
import { BREW_TYPES, RESOURCE_LANGUAGES } from "@/lib/resource-types";

export const dynamic = "force-static";

export function generateStaticParams() {
  return BREW_TYPES.flatMap((type) =>
    RESOURCE_LANGUAGES.map((language) => ({ type, language })),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; language: string }> },
) {
  const { type, language } = await params;

  if (!isBrewType(type)) {
    return Response.json({ error: "invalid-resource-type" }, { status: 404 });
  }

  if (!isResourceLanguage(language)) {
    return Response.json({ error: "invalid-resource-language" }, { status: 400 });
  }

  return Response.json(getResourcesResponse(type, language));
}

import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/resources/[type]/[language]/route";
import { getResourcesResponse, selectResourceLanguage } from "@/lib/resources";

describe("resource resolver", () => {
  it("returns available languages and resources for a type", () => {
    const result = getResourcesResponse("adversary", "es");

    expect(result.type).toBe("adversary");
    expect(result.requestedLanguage).toBe("es");
    expect(result.selectedLanguage).toBe("es");
    expect(result.availableLanguages).toEqual(["en", "es", "pt-br"]);
    expect(result.resources.length).toBeGreaterThan(0);
    expect(result.resources.every((resource) => resource.language === "es")).toBe(true);
  });

  it("falls back to the first available language when the requested one is absent", () => {
    expect(selectResourceLanguage(["en", "es"], "pt-br")).toBe("en");
  });

  it("returns 404 for invalid resource type", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ type: "monster", language: "es" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 400 for invalid resource language", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ type: "adversary", language: "fr" }),
    });

    expect(response.status).toBe(400);
  });
});

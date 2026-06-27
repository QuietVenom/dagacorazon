import { notFound } from "next/navigation";
import { schemas, schemaBySlug } from "@/lib/creators";
import { BrewCreator } from "@/components/brew-creator";

export function generateStaticParams() {
  return schemas.map((e) => ({ slug: e.slug }));
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const schema = schemaBySlug(slug);
  if (!schema) notFound();

  return <BrewCreator schema={schema} />;
}

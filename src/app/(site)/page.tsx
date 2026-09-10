import { HomePage } from "@/components/site/home-page";
import { getPublicContent } from "@/lib/content/repository";
import { getActiveServices } from "@/lib/services/repository";

export const revalidate = 300;

export default async function Page() {
  const [content, services] = await Promise.all([getPublicContent(), getActiveServices().catch(() => [])]);
  return <HomePage content={content} services={services} />;
}

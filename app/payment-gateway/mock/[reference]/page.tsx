import { MockGatewayClient } from "@/components/mock-gateway-client";

export default async function MockGatewayPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ userId?: string }>;
}) {
  const { reference } = await params;
  const query = await searchParams;

  return <MockGatewayClient reference={reference} userId={query.userId ?? "admin-utama"} />;
}

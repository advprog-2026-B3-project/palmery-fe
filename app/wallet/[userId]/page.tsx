import { redirect } from "next/navigation";

export default async function WalletUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  redirect(`/wallet?userId=${encodeURIComponent(userId)}`);
}

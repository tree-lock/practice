import { getTopics } from "@/app/actions/topic";
import { AppShell } from "@/components/app-shell";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TopicPage({ params }: PageProps) {
  await params; // route segment required for /dashboard/topics/[id]
  const userId = await getCurrentUserId();
  const topics = await getTopics();

  return (
    <AppShell
      topics={topics}
      userLabel={userId ? `用户 ${userId.slice(0, 8)}` : "未登录"}
    >
      <div />
    </AppShell>
  );
}

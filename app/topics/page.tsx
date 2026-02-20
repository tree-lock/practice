import { getTopics } from "@/app/actions/topic";
import { TopicForm, TopicList } from "@/components/topic-manager";

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto max-w-5xl p-8">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">目录管理</h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-700">
              新建目录
            </h2>
            <TopicForm />
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-700">
              已有目录
            </h2>
            <TopicList topics={topics} />
          </div>
        </div>
      </div>
    </div>
  );
}

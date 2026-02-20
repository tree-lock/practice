export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
      <main className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-800">AI 智能刷题助手</h1>
        <p className="mt-4 text-slate-600">
          欢迎使用本项目。你可以先进入目录管理创建一级目录，再逐步接入题目上传、判题与复习策略。
        </p>
        <a
          className="mt-8 inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
          href="/topics"
        >
          进入目录管理
        </a>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createTopic, deleteTopic } from "@/app/actions/topic";

interface Topic {
  id: string;
  name: string;
  description: string | null;
}

export function TopicList({ topics }: { topics: Topic[] }) {
  // 先提供清晰可读的平铺列表，后续可升级为树形结构
  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <div
          key={topic.id}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm"
        >
          <div>
            <h3 className="font-bold">{topic.name}</h3>
            <p className="text-sm text-slate-500">
              {topic.description || "暂无描述"}
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (confirm("确认删除该目录吗？")) {
                await deleteTopic(topic.id);
              }
            }}
            className="text-rose-500 hover:underline"
          >
            删除
          </button>
        </div>
      ))}
    </div>
  );
}

export function TopicForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTopic({ name, description });
    setName("");
    setDescription("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm"
    >
      <h2 className="text-lg font-bold">添加目录</h2>
      <div>
        <label htmlFor="topic-name" className="block text-sm font-medium">
          名称
        </label>
        <input
          id="topic-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white p-2 text-slate-800"
          required
        />
      </div>
      <div>
        <label
          htmlFor="topic-description"
          className="block text-sm font-medium"
        >
          描述
        </label>
        <textarea
          id="topic-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white p-2 text-slate-800"
        />
      </div>
      <button
        type="submit"
        className="rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-500"
      >
        创建目录
      </button>
    </form>
  );
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { treeifyError, z } from "zod";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";

const topicSchema = z.object({
  name: z.string().min(1, "目录名称不能为空"),
  description: z.string().optional(),
});

export async function getTopics() {
  return await db.select().from(topics);
}

export async function createTopic(data: z.infer<typeof topicSchema>) {
  const validated = topicSchema.safeParse(data);
  if (!validated.success) {
    return { error: treeifyError(validated.error) };
  }

  try {
    await db.insert(topics).values({
      name: validated.data.name,
      description: validated.data.description,
    });
    revalidatePath("/topics");
    return { success: true };
  } catch (error) {
    console.error("创建目录失败:", error);
    return { error: "创建目录失败" };
  }
}

export async function updateTopic(
  id: string,
  data: z.infer<typeof topicSchema>,
) {
  const validated = topicSchema.safeParse(data);
  if (!validated.success) {
    return { error: treeifyError(validated.error) };
  }

  try {
    await db
      .update(topics)
      .set({
        name: validated.data.name,
        description: validated.data.description,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, id));
    revalidatePath("/topics");
    return { success: true };
  } catch (error) {
    console.error("更新目录失败:", error);
    return { error: "更新目录失败" };
  }
}

export async function deleteTopic(id: string) {
  try {
    await db.delete(topics).where(eq(topics.id, id));
    revalidatePath("/topics");
    return { success: true };
  } catch (error) {
    console.error("删除目录失败:", error);
    return { error: "删除目录失败" };
  }
}

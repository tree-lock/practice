"use client";

import {
  ArrowUpIcon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  MixerHorizontalIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { Badge, Flex, IconButton } from "@radix-ui/themes";
import { useCallback, useEffect, useRef, useState } from "react";

export function AgentCommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MIN_TEXTAREA_HEIGHT = isMaximized ? 420 : 60;
  const MAX_TEXTAREA_HEIGHT = isMaximized ? 640 : 320;

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(
      Math.max(el.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    );
    el.style.height = `${next}px`;
  }, [MAX_TEXTAREA_HEIGHT, MIN_TEXTAREA_HEIGHT]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  useEffect(() => {
    if (isMaximized) {
      document.body.classList.add("agent-input-maximized");
    } else {
      document.body.classList.remove("agent-input-maximized");
    }

    return () => {
      document.body.classList.remove("agent-input-maximized");
    };
  }, [isMaximized]);

  function addFiles(newFiles: FileList | File[]) {
    const list = Array.from(newFiles);
    setFiles((prev) => [...prev, ...list]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files;
    if (dropped?.length) addFiles(dropped);
  }

  return (
    <Flex direction="column" gap="5" style={{ width: "100%", maxWidth: 760 }}>
      <Flex
        direction="column"
        gap="2"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: isDragging ? "#f0f4f8" : "#fafbfc",
          borderRadius: 16,
          border: isDragging ? "2px dashed #3b82f6" : "1px solid #e8ecf1",
          padding: "14px 16px",
          minHeight: isMaximized ? 560 : 140,
          maxHeight: isMaximized ? "72vh" : undefined,
          transition: "background 0.15s, border 0.15s",
          position: "relative",
        }}
      >
        <IconButton
          type="button"
          variant="ghost"
          color="gray"
          size="1"
          aria-label={isMaximized ? "退出最大化" : "最大化输入框"}
          onClick={() => setIsMaximized((prev) => !prev)}
          style={{ position: "absolute", top: 10, right: 10 }}
        >
          {isMaximized ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
          aria-hidden
          onChange={(e) => {
            const selected = e.target.files;
            if (selected?.length) addFiles(selected);
            e.target.value = "";
          }}
        />
        <textarea
          ref={textareaRef}
          placeholder="上传题目，文字、图片或文档（可拖拽文件到此处）"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            adjustTextareaHeight();
          }}
          onInput={adjustTextareaHeight}
          rows={1}
          style={{
            minHeight: MIN_TEXTAREA_HEIGHT,
            maxHeight: MAX_TEXTAREA_HEIGHT,
            overflowY: "auto",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            width: "100%",
            font: "inherit",
            padding: 0,
            lineHeight: 1.5,
          }}
        />
        {files.length > 0 ? (
          <Flex gap="2" wrap="wrap">
            {files.map((file, i) => (
              <Badge
                key={`${file.name}-${i}`}
                color="gray"
                style={{ cursor: "pointer" }}
                onClick={() => removeFile(i)}
                title="点击移除"
              >
                {file.name} ×
              </Badge>
            ))}
          </Flex>
        ) : null}
        <Flex justify="between" align="center" style={{ marginTop: "auto" }}>
          <Flex gap="1">
            <IconButton
              type="button"
              variant="soft"
              color="gray"
              size="1"
              aria-label="添加文件"
              onClick={() => fileInputRef.current?.click()}
            >
              <PlusIcon />
            </IconButton>
            <IconButton
              type="button"
              variant="soft"
              color="gray"
              size="1"
              aria-label="选项"
            >
              <MixerHorizontalIcon />
            </IconButton>
          </Flex>
          <IconButton
            type="button"
            color="gray"
            size="1"
            aria-label="发送"
            style={{ background: "#6b7280", color: "white" }}
          >
            <ArrowUpIcon />
          </IconButton>
        </Flex>
      </Flex>
    </Flex>
  );
}

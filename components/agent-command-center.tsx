"use client";

import {
  ArrowUpIcon,
  CheckIcon,
  Cross2Icon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  MixerHorizontalIcon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { Flex, IconButton, Select, Text, TextField } from "@radix-ui/themes";
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { getNextUploadMock } from "@/lib/mock/agent-upload-mocks";

type UploadFileItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type GenerateStatus = "idle" | "generating" | "done" | "stopped";

type CatalogActionType = "save-existing" | "create-new";

type CatalogActionOption = {
  id: string;
  type: CatalogActionType;
  optionLabel: string;
  suggestion: string;
};

type QuestionMarkdownContentProps = {
  questionMarkdown: string;
};

const QuestionMarkdownContent = memo(function QuestionMarkdownContent({
  questionMarkdown,
}: QuestionMarkdownContentProps) {
  return (
    <div style={{ lineHeight: 1.65 }}>
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {questionMarkdown}
      </ReactMarkdown>
    </div>
  );
});

type QuestionPanelProps = {
  generateStatus: GenerateStatus;
  questionMarkdown: string;
  mockSourceLabel: string | null;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  catalogOptions: Array<CatalogActionOption>;
  existingCatalogCandidates: Array<string>;
  selectedCatalogActionId: string | null;
  selectedExistingCatalog: string;
  newCatalogInput: string;
  onSelectCatalogAction: (id: string) => void;
  onSelectExistingCatalog: (value: string) => void;
  onNewCatalogInputChange: (value: string) => void;
  onConfirmCatalogAction: () => void;
};

function QuestionPanel({
  generateStatus,
  questionMarkdown,
  mockSourceLabel,
  isEditing,
  draftValue,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  catalogOptions,
  existingCatalogCandidates,
  selectedCatalogActionId,
  selectedExistingCatalog,
  newCatalogInput,
  onSelectCatalogAction,
  onSelectExistingCatalog,
  onNewCatalogInputChange,
  onConfirmCatalogAction,
}: QuestionPanelProps) {
  const selectedCatalogOption =
    catalogOptions.find((option) => option.id === selectedCatalogActionId) ??
    null;
  const effectiveCatalogValue =
    selectedCatalogOption?.type === "save-existing"
      ? selectedExistingCatalog
      : newCatalogInput;

  return (
    <Flex direction="column" gap="2" style={{ padding: "12px 14px" }}>
      <Flex justify="between" align="center">
        <Text size="2" weight="bold">
          题目（Markdown + 公式）
        </Text>
        {generateStatus === "done" ? (
          <Flex gap="2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  aria-label="取消编辑题目"
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    width: 26,
                    height: 22,
                    padding: 0,
                    background: "#fff",
                    color: "#4b5563",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Cross2Icon />
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  aria-label="保存题目编辑"
                  style={{
                    border: "1px solid #bfdbfe",
                    borderRadius: 6,
                    width: 26,
                    height: 22,
                    padding: 0,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartEdit}
                aria-label="编辑题目"
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  width: 26,
                  height: 22,
                  padding: 0,
                  background: "#fff",
                  color: "#4b5563",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil2Icon />
              </button>
            )}
          </Flex>
        ) : null}
      </Flex>
      {generateStatus === "generating" ? (
        <Text size="2" color="gray">
          正在模拟生成题目内容...
        </Text>
      ) : null}
      {generateStatus === "stopped" ? (
        <Text size="2" color="gray">
          已停止生成。你可以再次点击上传按钮重新生成。
        </Text>
      ) : null}
      {generateStatus === "done" && questionMarkdown ? (
        <Flex direction="column" gap="2">
          {mockSourceLabel ? (
            <Text size="1" color="gray">
              模拟来源：{mockSourceLabel}
            </Text>
          ) : null}
          {isEditing ? (
            <textarea
              value={draftValue}
              onChange={(event) => onDraftChange(event.target.value)}
              style={{
                width: "100%",
                minHeight: 120,
                border: "1px solid #dbe1ea",
                borderRadius: 8,
                padding: "8px 10px",
                font: "inherit",
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
          ) : (
            <QuestionMarkdownContent questionMarkdown={questionMarkdown} />
          )}
          {!isEditing && catalogOptions.length > 0 ? (
            <Flex
              direction="column"
              gap="2"
              style={{
                marginTop: 4,
                paddingTop: 10,
                borderTop: "1px solid #eef2f7",
              }}
            >
              <Text size="1" color="gray">
                Agent 目录建议
              </Text>
              <Flex gap="2" wrap="wrap" align="center">
                <Select.Root
                  value={selectedCatalogActionId ?? undefined}
                  onValueChange={onSelectCatalogAction}
                  size="1"
                >
                  <Select.Trigger
                    aria-label="选择目录操作"
                    placeholder="选择目录操作"
                    style={{ minWidth: 150 }}
                  />
                  <Select.Content position="popper">
                    {catalogOptions.map((option) => (
                      <Select.Item key={option.id} value={option.id}>
                        {option.optionLabel}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
                {selectedCatalogOption?.type === "save-existing" ? (
                  <div style={{ flex: 1, minWidth: 210 }}>
                    <Select.Root
                      value={selectedExistingCatalog || undefined}
                      onValueChange={onSelectExistingCatalog}
                      size="1"
                    >
                      <Select.Trigger
                        aria-label="选择已有目录"
                        placeholder="选择已有目录"
                        style={{ width: "100%" }}
                      />
                      <Select.Content position="popper">
                        {existingCatalogCandidates.map((catalog) => (
                          <Select.Item key={catalog} value={catalog}>
                            {catalog}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </div>
                ) : (
                  <TextField.Root
                    size="1"
                    aria-label="目录名称"
                    value={newCatalogInput}
                    onChange={(event) =>
                      onNewCatalogInputChange(event.target.value)
                    }
                    placeholder="输入目录名称"
                    style={{ flex: 1, minWidth: 210 }}
                  />
                )}
                <button
                  type="button"
                  onClick={onConfirmCatalogAction}
                  disabled={
                    !selectedCatalogActionId || !effectiveCatalogValue.trim()
                  }
                  aria-label="确认目录方案"
                  style={{
                    width: 30,
                    height: 30,
                    border: "none",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      selectedCatalogActionId && effectiveCatalogValue.trim()
                        ? "#2563eb"
                        : "#93c5fd",
                    color: "#fff",
                    opacity:
                      selectedCatalogActionId && effectiveCatalogValue.trim()
                        ? 1
                        : 0.7,
                    boxShadow:
                      selectedCatalogActionId && effectiveCatalogValue.trim()
                        ? "0 4px 10px rgba(37, 99, 235, 0.28)"
                        : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <CheckIcon width={14} height={14} />
                </button>
              </Flex>
            </Flex>
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  );
}

function buildCatalogActions(
  catalogs: Array<string>,
): Array<CatalogActionOption> {
  const existing = catalogs[0] ?? "通用复习/默认目录";
  const base = existing.split("/")[0] ?? "通用复习";
  const created = `${base}/新建目录`;
  return [
    {
      id: `existing-${existing}`,
      type: "save-existing",
      optionLabel: "存到已有目录",
      suggestion: existing,
    },
    {
      id: `create-${created}`,
      type: "create-new",
      optionLabel: "新建目录并存入",
      suggestion: created,
    },
  ];
}

export function AgentCommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>("idle");
  const [questionMarkdown, setQuestionMarkdown] = useState("");
  const [catalogOptions, setCatalogOptions] = useState<
    Array<CatalogActionOption>
  >([]);
  const [existingCatalogCandidates, setExistingCatalogCandidates] = useState<
    Array<string>
  >([]);
  const [selectedCatalogActionId, setSelectedCatalogActionId] = useState<
    string | null
  >(null);
  const [selectedExistingCatalog, setSelectedExistingCatalog] = useState("");
  const [newCatalogInput, setNewCatalogInput] = useState("");
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [mockSourceLabel, setMockSourceLabel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filesRef = useRef<UploadFileItem[]>([]);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function toUploadItem(file: File): UploadFileItem {
    return {
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    };
  }

  function addFiles(newFiles: FileList | File[]) {
    const items = Array.from(newFiles).map(toUploadItem);
    setFiles((prev) => [...prev, ...items]);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
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

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
      }
      for (const file of filesRef.current) {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      }
    };
  }, []);

  const canStartGenerate = files.length > 0 || prompt.trim().length > 0;

  function stopGenerating() {
    if (generateTimerRef.current) {
      clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
    setIsEditingQuestion(false);
    setGenerateStatus("stopped");
  }

  function startGenerating() {
    if (generateTimerRef.current) {
      clearTimeout(generateTimerRef.current);
    }
    setGenerateStatus("generating");
    setQuestionMarkdown("");
    setCatalogOptions([]);
    setExistingCatalogCandidates([]);
    setSelectedCatalogActionId(null);
    setSelectedExistingCatalog("");
    setNewCatalogInput("");
    setIsEditingQuestion(false);
    setQuestionDraft("");
    setMockSourceLabel(null);

    const mock = getNextUploadMock();
    const delayMs = 1200 + Math.floor(Math.random() * 800);

    generateTimerRef.current = setTimeout(() => {
      const nextCatalogOptions = buildCatalogActions(
        mock.output.recommendedCatalog,
      );
      const defaultCatalogOption = nextCatalogOptions[0];
      const nextExistingCatalogs = mock.output.recommendedCatalog;
      const defaultExistingCatalog = nextExistingCatalogs[0] ?? "";
      const createOption = nextCatalogOptions.find(
        (option) => option.type === "create-new",
      );
      setMockSourceLabel(mock.input.sourceLabel);
      setQuestionMarkdown(mock.output.questionMarkdown);
      setCatalogOptions(nextCatalogOptions);
      setExistingCatalogCandidates(nextExistingCatalogs);
      setSelectedCatalogActionId(defaultCatalogOption?.id ?? null);
      setSelectedExistingCatalog(defaultExistingCatalog);
      setNewCatalogInput(createOption?.suggestion ?? "");
      setQuestionDraft(mock.output.questionMarkdown);
      setGenerateStatus("done");
      generateTimerRef.current = null;
    }, delayMs);
  }

  function handleGenerateClick() {
    if (generateStatus === "generating") {
      stopGenerating();
      return;
    }
    if (!canStartGenerate) {
      return;
    }
    startGenerating();
  }

  const generateButtonDisabled =
    generateStatus !== "generating" && !canStartGenerate;
  const shouldShowResultPanels = files.length > 0 || generateStatus !== "idle";

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
          <Flex gap="2" wrap="wrap" mt="1">
            {files.map((item) => (
              <Flex
                key={item.id}
                direction="column"
                gap="1"
                style={{
                  width: 98,
                  borderRadius: 12,
                  border: "1px solid #d9dee8",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <Flex
                  align="start"
                  justify="end"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 72,
                    background: "#eef2f7",
                  }}
                >
                  {item.previewUrl ? (
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      fill
                      sizes="98px"
                      unoptimized
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Text size="1" color="gray">
                        {item.file.name.split(".").pop()?.toUpperCase() ??
                          "FILE"}
                      </Text>
                    </Flex>
                  )}
                  <IconButton
                    type="button"
                    variant="solid"
                    color="gray"
                    size="1"
                    aria-label="移除文件"
                    onClick={() => removeFile(item.id)}
                    style={{
                      margin: 4,
                      zIndex: 1,
                      background: "rgba(17, 24, 39, 0.65)",
                      color: "#fff",
                    }}
                  >
                    <Cross2Icon />
                  </IconButton>
                </Flex>
                <Text
                  size="1"
                  style={{
                    padding: "0 6px 6px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.file.name}
                >
                  {item.file.name}
                </Text>
              </Flex>
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
          <button
            type="button"
            aria-label={
              generateStatus === "generating" ? "停止生成" : "上传并生成"
            }
            disabled={generateButtonDisabled}
            onClick={handleGenerateClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              transition: "all 0.2s ease",
              background: generateButtonDisabled
                ? "#9ca3af"
                : generateStatus === "generating"
                  ? "#1f2432"
                  : "#111827",
              boxShadow: generateButtonDisabled
                ? "none"
                : "0 3px 8px rgba(17, 24, 39, 0.22)",
              color: "#fff",
              opacity: generateButtonDisabled ? 0.72 : 1,
            }}
          >
            {generateStatus === "generating" ? (
              <Cross2Icon width={14} height={14} />
            ) : (
              <ArrowUpIcon width={14} height={14} />
            )}
          </button>
        </Flex>
      </Flex>
      {shouldShowResultPanels ? (
        <Flex direction="column" gap="3" style={{ width: "100%" }}>
          <Flex
            direction="column"
            style={{
              background: "#fff",
              border: "1px solid #e5eaf3",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <QuestionPanel
              generateStatus={generateStatus}
              questionMarkdown={questionMarkdown}
              mockSourceLabel={mockSourceLabel}
              isEditing={isEditingQuestion}
              draftValue={questionDraft}
              onDraftChange={setQuestionDraft}
              onStartEdit={() => {
                setQuestionDraft(questionMarkdown);
                setIsEditingQuestion(true);
              }}
              onCancelEdit={() => {
                setQuestionDraft(questionMarkdown);
                setIsEditingQuestion(false);
              }}
              onSaveEdit={() => {
                setQuestionMarkdown(questionDraft.trim());
                setIsEditingQuestion(false);
              }}
              catalogOptions={catalogOptions}
              existingCatalogCandidates={existingCatalogCandidates}
              selectedCatalogActionId={selectedCatalogActionId}
              selectedExistingCatalog={selectedExistingCatalog}
              newCatalogInput={newCatalogInput}
              onSelectCatalogAction={(id) => {
                setSelectedCatalogActionId(id);
              }}
              onSelectExistingCatalog={(value) => {
                setSelectedExistingCatalog(value);
              }}
              onNewCatalogInputChange={(value) => {
                setNewCatalogInput(value);
              }}
              onConfirmCatalogAction={() => {
                const selectedOption =
                  catalogOptions.find(
                    (option) => option.id === selectedCatalogActionId,
                  ) ?? null;
                const effectiveCatalogValue =
                  selectedOption?.type === "save-existing"
                    ? selectedExistingCatalog
                    : newCatalogInput;
                if (!selectedCatalogActionId || !effectiveCatalogValue.trim()) {
                  return;
                }
              }}
            />
          </Flex>
        </Flex>
      ) : null}
    </Flex>
  );
}

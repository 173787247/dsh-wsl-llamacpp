import { createOpenAiCompatClient } from "./lib/client.js";

export const name = "dsh-wsl-llamacpp";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  if (config.enabled === false) {
    console.log("[dsh-wsl-llamacpp] disabled");
    return;
  }
  const client = createOpenAiCompatClient({
    baseUrl: config.baseUrl || process.env.DSH_LLAMA_BASE || "http://127.0.0.1:8080",
    defaultModel: config.defaultModel || process.env.DSH_LLAMA_MODEL || "",
    apiKey: config.apiKey || "",
    timeoutMs: positive(config.timeoutMs, 120_000),
    maxPromptChars: positive(config.maxPromptChars, 32_000),
    label: "llamacpp",
  });
  console.log(`[dsh-wsl-llamacpp] base=${client.root}`);

  ctx.systemPrompt.section({
    name: "tool:llamacpp",
    order: 128,
    text: "dsh-wsl-llamacpp talks to a local llama.cpp (or Unsloth Desktop) OpenAI-compatible server. Default http://127.0.0.1:8080. Use llama_status before llama_chat. Do not reinstall toolchains — reuse existing GGUF servers.",
  });

  const timeoutMs = client.timeoutMs;

  ctx.tools.register({
    name: "llama_status",
    description: "Check llama.cpp / Unsloth OpenAI-compatible server reachability and model ids.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: { schema: { type: "object", additionalProperties: true }, render: (_a, v) => [{ type: "text", text: JSON.stringify(v, null, 2) }] },
    timeoutMs: 15_000,
    isConcurrencySafe: () => true,
    async execute() {
      return client.status();
    },
    presentCall: () => ({ card: "generic", title: "llama.cpp status" }),
    presentResult: (_a, r) => ({ card: "generic", title: "llama.cpp status", content: r.content }),
  });

  ctx.tools.register({
    name: "llama_chat",
    description: "Chat completion via local llama.cpp-compatible /v1/chat/completions.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        model: { type: "string" },
        prompt: { type: "string" },
        system: { type: "string" },
        maxTokens: { type: "number" },
      },
    },
    output: {
      schema: { type: "object", additionalProperties: true },
      render: (_a, v) => [{ type: "text", text: v.ok === false ? v.error : String(v.message || "") }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      try {
        return await client.chat(args || {});
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
    presentCall: () => ({ card: "generic", title: "llama chat" }),
    presentResult: (_a, r) => ({ card: "generic", title: "llama chat", content: r.content }),
  });
}

function positive(v, fb) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fb;
}

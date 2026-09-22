/** OpenAI-compatible HTTP (llama.cpp server / Unsloth Desktop / similar). */

export function createOpenAiCompatClient({
  baseUrl,
  defaultModel = "",
  apiKey = "",
  timeoutMs = 120_000,
  maxPromptChars = 32_000,
  fetchImpl = fetch,
  label = "openai-compat",
} = {}) {
  const root = String(baseUrl || "http://127.0.0.1:8080").replace(/\/$/, "");
  const key = String(apiKey || process.env.DSH_LLAMA_API_KEY || "").trim();

  async function request(path, { method = "GET", body } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const headers = {};
      if (body) headers["Content-Type"] = "application/json";
      if (key) headers.Authorization = `Bearer ${key}`;
      const res = await fetchImpl(`${root}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`${label} non-JSON ${res.status}: ${text.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error(`${label} HTTP ${res.status}: ${json?.error?.message || json?.error || text.slice(0, 200)}`);
      return json;
    } finally {
      clearTimeout(t);
    }
  }

  return {
    root,
    defaultModel,
    timeoutMs,
    async status() {
      try {
        const models = await request("/v1/models");
        const ids = (models.data || []).map((m) => m.id);
        return { ok: true, baseUrl: root, reachable: true, models: ids, defaultModel: defaultModel || null };
      } catch (e) {
        return {
          ok: true,
          baseUrl: root,
          reachable: false,
          error: e instanceof Error ? e.message : String(e),
          models: [],
          defaultModel: defaultModel || null,
        };
      }
    },
    async chat({ model, prompt, system, messages, maxTokens = 1024 }) {
      const m = String(model || defaultModel || "").trim();
      if (!m) throw new Error(`${label}: model required (or set defaultModel)`);
      let msgs = Array.isArray(messages)
        ? messages.map((x) => ({ role: x.role, content: String(x.content || "") }))
        : [];
      if (!msgs.length) {
        const p = String(prompt || "").trim();
        if (!p) throw new Error(`${label}: prompt or messages required`);
        if (system) msgs.push({ role: "system", content: String(system) });
        msgs.push({ role: "user", content: p.slice(0, maxPromptChars) });
      }
      const json = await request("/v1/chat/completions", {
        method: "POST",
        body: {
          model: m,
          messages: msgs,
          max_tokens: Math.min(4096, Math.max(1, Number(maxTokens) || 1024)),
          stream: false,
        },
      });
      const content = json.choices?.[0]?.message?.content || "";
      return {
        ok: true,
        model: json.model || m,
        message: content,
        usage: json.usage || null,
      };
    },
  };
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createOpenAiCompatClient } from "../lib/client.js";

describe("llamacpp client", () => {
  it("reports unreachable without server", async () => {
    const c = createOpenAiCompatClient({
      baseUrl: "http://127.0.0.1:1",
      timeoutMs: 500,
      fetchImpl: async () => {
        throw new Error("refused");
      },
    });
    const st = await c.status();
    assert.equal(st.reachable, false);
  });
});

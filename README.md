# dsh-wsl-llamacpp

> **语言：** **中文**（本页） · [English](./README.en.md)

对接本机 **llama.cpp server / Unsloth Desktop** 的 OpenAI 兼容接口（默认 http://127.0.0.1:8080）。

可选插件，不在 install.sh。复用已有 GGUF，不重装工具链。

## 工具

| 工具 | 作用 |
|------|------|
| `llama_status` | 是否可达、模型列表 |
| `llama_chat` | `/v1/chat/completions` |

环境变量：`DSH_LLAMA_BASE`、`DSH_LLAMA_MODEL`。

## License

MIT

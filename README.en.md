# dsh-wsl-llamacpp

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

OpenAI-compatible client for llama.cpp / Unsloth Desktop (default :8080).

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-llamacpp
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `llama_status` | reachability + model ids |
| `llama_chat` | chat completions |

## Config

`baseUrl / defaultModel / timeoutMs`

Reuse existing GGUF servers. Env: `DSH_LLAMA_BASE`, `DSH_LLAMA_MODEL`.

## License

MIT

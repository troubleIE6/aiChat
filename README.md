# AI 陪伴 App (AI Companion)

这是一个基于 React、Tailwind CSS、Express 和 SQLite 的 AI 陪伴应用。它模拟了微信/WhatsApp 的界面风格，并提供了多种性格迥异的 AI 伴侣供用户选择。

支持 DeepSeek API 进行智能对话，以及 Qwen API 预留接口用于图片生成。

## 功能特点

*   **多重性格角色**：内置 8 种性格（精神小妹、御姐、萝莉、知心姐姐、成熟暖男、奶油小生、小屁孩、钢铁直男），每个角色都有独特的 System Prompt。
*   **持久化存储**：使用 SQLite 数据库保存聊天记录，刷新页面不丢失。
*   **历史记录管理**：支持一键清空特定角色的聊天记录，随时“重新开始”。
*   **混合模式**：支持配置真实 API Key，未配置时自动降级为模拟数据模式。

## 快速开始

### 1. 安装依赖

该项目包含 `frontend` (前端) 和 `backend` (后端) 两个部分，需要分别安装。

**前端：**

```bash
cd frontend
npm install
```

**后端：**

```bash
cd backend
npm install
```

### 2. 配置 API Key

打开 `frontend/src/services/api.ts` 文件，找到顶部配置区域：

```typescript
// Configuration for API Keys - REPLACE WITH YOUR KEYS
const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY'; // 在这里填入你的 DeepSeek API Key
const QWEN_API_KEY = 'YOUR_QWEN_API_KEY';         // 在这里填入你的 Qwen API Key
```

*   **DeepSeek API**: 填入 Key 后，对话将自动切换为真实 AI 回复。
*   **Qwen API**: 目前图片生成主要为模拟（返回随机头像），代码中已预留接入位置。

### 3. 启动项目

你需要同时运行前后端服务。建议打开两个终端窗口。

**终端 1 (后端):**

```bash
cd backend
node index.js
```
*后端服务运行在 `http://localhost:3001`*

**终端 2 (前端):**

```bash
cd frontend
npm run dev
```
*前端服务运行在 `http://localhost:5173`*

访问 `http://localhost:5173` 即可开始使用。

## API 接口说明

本项目包含两部分 API：

1.  **本地后端 API (`backend/index.js`)**: 用于存取聊天记录。
    *   `GET /api/messages/:personaId`: 获取历史记录
    *   `POST /api/messages`: 保存消息
    *   `DELETE /api/messages/:personaId`: 清空历史

2.  **第三方 AI API (`frontend/src/services/api.ts`)**: 用于生成回复。
    *   **DeepSeek API**: 用于文本对话生成。
    *   **Qwen API (预留)**: 用于图片生成。

### API Key 应该放在哪里？

*   **简单的做法（当前实现）**：直接写在前端代码 `frontend/src/services/api.ts` 中。这适合个人本地使用或演示。
*   **安全的做法（推荐用于生产）**：
    1.  将 API Key 移至 `backend` 的 `.env` 文件中。
    2.  在 `backend` 创建一个新的代理接口（如 `/api/chat`）。
    3.  前端请求后端的 `/api/chat`，由后端去请求 DeepSeek/Qwen，然后将结果返回给前端。
    4.  这样可以避免将 API Key 暴露在浏览器端。

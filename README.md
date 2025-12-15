# 拼拼中国 (PinPin China) - Web Game

PinPin China 是一款基于 Web 的中国地图拼图与地理知识问答游戏。玩家通过拖拽省份拼图还原中国地图，并通过快速反应的游戏模式强化对省会城市的记忆。

## 🎮 游戏内容 (Gameplay)

### Level 1: 省份拼拼看-简单模式 (Easy Mode)
*   **目标**: 还原中国地图。
*   **玩法**: 34 个省份拼图散落在屏幕两侧，玩家需要将其拖拽到地图中央的正确位置。拼图接近正确位置时会自动吸附。
*   **特色**:
    *   **柔和配色**: 采用莫兰迪色系。
    *   **五星红旗**: 拼图归位后变为红旗纹理。
    *   **智能标注**: 显示省份简称。
    *   **计时挑战**: 右上角实时显示耗时。

### Level 2: 省份拼拼看-挑战模式 (Hard Mode)
*   **目标**: 依靠形状记忆还原地图。
*   **挑战升级**:
    *   **无边界 (No Borders)**: 地图底板仅保留中国外轮廓。
    *   **精准吸附 (Precision)**: 取消吸附提示，拼图必须精确放置。
    *   **无提示**: 移除拖拽时的高亮提示。
    *   **隐形标签**: 默认隐藏省份名称（部分除外）。
    *   **继承计时**: 计时器累计 Level 1 的时间。

### 结算 (End Game)
*   **恭喜通关**: 显示完成总耗时。
*   **再来一次**: 重置游戏循环。

---

## 🛠 技术架构 (Tech Stack)

*   **Core Engine**: [Phaser 3](https://phaser.io/) (v3.80+) - 强大的 2D 游戏引擎，处理渲染、物理和场景管理。
*   **Language**: [TypeScript](https://www.typescriptlang.org/) - 强类型 JavaScript，保证代码健壮性。
*   **Build Tool**: [Vite](https://vitejs.dev/) - 极速的现代前端构建工具。
*   **Data Pipeline**: 
    *   源数据: GeoJSON (中国行政区划数据)。
    *   处理脚本: `scripts/build-map-data.ts` (基于 `d3-geo` 投影和 `simplify-js` 优化)。
    *   运行时数据: `src/assets/map_data.json` (包含预计算的路径点和边界框)。
*   **Audio**: Web Audio API (通过 `SoundManager` 实现合成音效，无需外部音频资源)。

---

## 📂 项目结构 (Project Structure)

```
/
├── scripts/                # 构建脚本
│   └── build-map-data.ts   # GeoJSON -> Game JSON 转换工具
├── src/
│   ├── assets/             # 静态资源 (生成的 map_data.json)
│   ├── data/               # 游戏数据
│   │   └── capitals.ts     # 省份 -> 省会 映射表
│   ├── objects/            # 游戏对象 (GameObjects)
│   │   ├── MapPiece.ts     # 拼图块 (交互、拖拽、吸附逻辑)
│   │   ├── MapSlot.ts      # 目标槽位 (地图轮廓)
│   │   └── FallingObject.ts# 掉落物 (Level 2 核心对象)
│   ├── scenes/             # 游戏场景
│   │   ├── BootScene.ts    # 启动与资源加载 (目前跳过 StartScene 用于测试)
│   │   ├── StartScene.ts   # 开始界面 (标题 & Play 按钮)
│   │   ├── GameScene.ts    # Level 1 主场景
│   │   └── Level2Scene.ts  # Level 2 主场景
│   ├── utils/              # 工具类
│   │   └── SoundManager.ts # 音效管理器 (Pop, Snap, Ding, Click)
│   ├── main.ts             # 游戏入口配置
│   └── types.ts            # TypeScript 类型定义
├── index.html              # Web 入口
├── package.json            # 依赖管理
└── vite.config.ts          # Vite 配置
```

---

## 🚀 快速开始 (Getting Started)

### 1. 安装依赖
Ensure you have Node.js installed.
```bash
npm install
```

### 2. 运行开发服务器
```bash
npm run dev
```
打开浏览器访问 `http://localhost:5173`。

### 3. 构建生产版本
```bash
npm run build
```
输出文件位于 `dist/` 目录。

### 4. (可选) 重新生成地图数据
如果修改了 GeoJSON 源数据或投影参数：
```bash
npm run build-map
```

---

## 🧩 核心接口说明 (Key Interfaces)

### `GameMapData` (src/types.ts)
游戏加载的核心地图数据结构。
```typescript
interface GameMapData {
    width: number;          // 原始投影宽度
    height: number;         // 原始投影高度
    provinces: ProvinceData[];
}
```

### `ProvinceData` (src/types.ts)
单个省份的数据描述。
```typescript
interface ProvinceData {
    name: string;           // 省份名称 (e.g., "北京市")
    adcode: number;         // 行政区划代码
    center: { x, y };       // 几何中心点 (用于定位)
    points: { x, y }[];     // 多边形顶点数组 (用于绘制形状)
    bounds: {               // 边界框 (用于碰撞检测优化)
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
}
```

### `SoundManager` (src/utils/SoundManager.ts)
单例音频管理器。
*   `playPop()`: 拾起/悬停音效。
*   `playSnap()`: 吸附成功音效。
*   `playClick()`: 点击音效。
*   `playDing()`: 匹配成功音效。
*   `playError()`: 错误/失败音效。

---

## ☁️ AWS 部署配置 (Deployment)

游戏已通过 **AWS Amplify** 托管，支持 GitHub 自动部署。

### 生产环境

| 配置项 | 值 |
|--------|-----|
| **访问域名** | https://game.xperbots.com |
| **Amplify App ID** | `d2n2j5kgym83z8` |
| **Amplify 默认域名** | `https://main.d2n2j5kgym83z8.amplifyapp.com` |
| **Region** | `us-east-1` |
| **GitHub 仓库** | `xperbots/game_map_puzzle` |
| **分支** | `main` |
| **CloudFront 分发** | `d2hkmk3f02hz1.cloudfront.net` |

### 自动部署流程

```
git push origin main
       ↓
GitHub Webhook 触发
       ↓
Amplify 自动构建 (npm run build)
       ↓
dist/ 部署到 CloudFront CDN
       ↓
https://game.xperbots.com 自动更新
```

### 管理入口

- **Amplify Console**: [AWS Amplify](https://console.aws.amazon.com/amplify/home?region=us-east-1#/d2n2j5kgym83z8)
- **Route 53 DNS**: [Hosted Zone](https://console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/Z0152583325982OF8RM2)

### 注意事项

1. **静态资源路径**: 确保 `public/` 目录下的文件（如 `map_data.json`）使用相对路径 `./` 引用。
2. **构建输出**: Vite 构建后的文件位于 `dist/`，Amplify 会自动部署此目录。
3. **费用**: 按托管存储 + 流量计费，低流量场景接近免费。

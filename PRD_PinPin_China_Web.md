## 1. 产品概述
拼拼中国（PinPin China）是一款面向 Web（HTML5/Canvas）的轻量级益智游戏，支持移动端与桌面端。玩家通过拖拽拼图与点击匹配省会，在趣味互动中熟悉中国省级行政区形状与省会。产品定位：寓教于乐、短时沉浸、即开即玩。

## 2. 核心功能

### 2.1 用户角色
| 角色 | 注册方式 | 核心权限 |
|------|----------|----------|
| 游客 | 无需注册 | 进入游戏、本地排行榜 |
| 会员 | 邮箱/第三方登录（可选） | 云存档、成就徽章 |

### 2.2 功能模块
本游戏包含以下最小页面集合：
1. **首页**：开始游戏、难度选择、音效开关
2. **第一关**：磁力拼图，拖拽省份至凹槽并吸附
3. **第二关**：省会雨，点击匹配掉落方块（含 5 秒“Pair Pool”规则）
4. **结算页**：得分、评价、重玩/分享

### 2.3 页面详情
| 页面 | 模块 | 功能描述 |
|------|------|----------|
| 首页 | 开始按钮 | 进入第一关 |
| 首页 | 难度选择 | 切换拼图数量与掉落速度 |
| 首页 | 音效开关 | 全局静音/开启 |
| 第一关 | 拼图槽 | 显示轮廓与吸附反馈 |
| 第一关 | 拼图块 | 可拖拽、自动吸附、播放音效与粒子 |
| 第二关 | 掉落区 | 省形状与省会名方块自上而下掉落 |
| 第二关 | 点击匹配 | 选中→再点击匹配，成功则消除并加分 |
| 第二关 | Pair Pool | 5 秒内必须生成对应省会名，否则游戏结束 |
| 结算页 | 得分展示 | 显示总分与星级 |
| 结算页 | 重玩/分享 | 本地重玩或生成分享图 |

## 3. 核心流程
游客打开首页 → 选择难度 → 进入第一关（磁力拼图）→ 完成全部拼图 → 进入第二关（省会雨）→ 在 5 秒内匹配“省份-省会”对 → 失败则游戏结束，成功则继续 → 结算页查看得分与评价。

```mermaid
graph TD
  A["首页"] --> B["第一关：磁力拼图"]
  B --> C["第二关：省会雨"]
  C --> D["结算页"]
  D --> A
```
 ### 4. Visual Design (UI/UX)
*   **Color Palette:**
    *   **Pastel Theme**: Uses soft, modern pastel colors (e.g., Pastel Pink `0xffadad`, Mint `0xcaffbf`, Sky Blue `0xa0c4ff`) for puzzle pieces to create a pleasant, non-intrusive visual experience.
    *   **Completion Style**: Snapped pieces transform into a **Unified Red Flag** texture.
    *   **Background**: Light Cyan (`0xe0f7fa`) or similar soft tone to provide contrast for the white map slot base.

*   **Map Elements:**
    *   **Base Map**: Clean White relief style with light grey strokes (`#cccccc`).
    *   **Active Pieces**: 3D Extruded effect with distinct pastel colors.
    *   **Snapped Pieces**: **Flat** (No depth), turning Red to form the Chinese National Flag.
    *   **Labels**: 
        *   **Smart Abbreviation**: Provinces display 2-character short names (e.g., "新疆", "上海"). Exceptions: "黑龙江", "内蒙古" (3 characters).
        *   **Visibility**: Text rendered on a top-level layer (Z>2000) to prevent occlusion.
        *   **Small Provinces**: Labels offset automatically for tiny areas like HK/Macau.

*   **Level 1 (Magnetic Map):**
    *   **Goal**: Reassemble the map.
    *   **Feedback**: 
        *   **Drag**: Piece scales up (1.1x) and casts shadow.
        *   **Snap**: Magnetic 'clack' sound, piece snaps to slot, turns Flat Red (Flag segment).
        *   **Win**: Full china map becomes a complete Five-Star Red Flag.

## 5. 音效与性能
- 音效：拖拽、吸附、消除、失败、胜利共 5 段，压缩至 64 kbps AAC/OGG，总大小 < 300 KB
- 性能目标：同屏精灵 ≤ 40 个，帧率 60 FPS，低端机可降至 30 FPS
- 加载策略：首屏预加载核心资源，后续按需懒加载

## 6. 资产处理要求 (Asset Pipeline)
- **核心数据源**: `/map_materials/中华人民共和国各省.geojson` (必须包含 name 和 geometry)
- **数据处理**: 
    - 不再解析 SVG 路径。
    - 使用脚本将 GeoJSON 经纬度投影转换为游戏坐标系 (Pixel)。
    - 生成优化的 JSON 数据供游戏加载。
- **输出格式**: RDP 简化后的顶点数组，确保碰撞检测性能。
- **校验标准**: 必须完整识别 34 个省级行政区 (含港澳台)，不得遗漏。

## 7. 里程碑与验收
- M1：资产校验脚本可运行并输出 ≥ 30 个省数据
- M2：第一关磁力拼图可拖拽吸附，完成全部拼图
- M3：第二关省会雨掉落与 5 秒 Pair Pool 逻辑完整
- M4：音效、粒子、结算页与分享功能上线
- M5：移动端触摸优化与性能达标，准备发布
# 🦕 恐龙乐园 (Dino Kids) — 儿童恐龙图鉴安卓 App

一款专为小朋友打造的离线恐龙科普图鉴 Android 应用（Kotlin + Jetpack Compose + Three.js PBR 高精 3D 模型）。

## ✨ 功能特色

- **10 种经典远古生物**：霸王龙、三角龙、腕龙、剑龙、甲龙、棘龙、副栉龙、迅猛龙、无齿翼龙、蛇颈龙，按「肉食恐龙 / 植食恐龙 / 天空与海洋」分类浏览，支持一键「随机看」。
- **精美儿童绘本风图片 + 全屏缩放看图**：
  - 每种恐龙均配有高清、色彩明快、友善可爱的绘本风插画，全部内置离线可用。
  - 点击图片或「全屏看图」按钮可进入全屏图库，支持**双指缩放、双击放大、拖动查看细节、左右切换上一张/下一张**以及中法英三语点读。
- **博物馆级高精 PBR 3D 恐龙模型**：
  - 全部 10 种恐龙均采用高精度 GLB 3D 雕塑/骨骼动画模型，配 PBR 物理光照（RoomEnvironment IBL + ACESFilmic 色调映射）与离线 Draco / Meshopt 解码。
  - 支持单指 360° 拖动旋转、双指缩放、自动旋转、阳光/黄昏光影切换、全屏 3D 查看；轻点恐龙或点击「🦖 动一动」触发骨骼动作/趣味互动与音效！
- **中 / 法 / 英三语名字与语音朗读**：每只恐龙均展示中文（附拼音）、法语（Français）与英语（English）名称，点击即可调用 Android 原生语音合成（TTS）读出发音。
- **儿童友好中文简介**：专为小朋友编写的生动中文简介、生活时代、食性、趣味大小对比，以及「你知道吗？」科普小彩蛋，支持一键「读给我听」。

## 📱 安装 APK 到安卓手机/平板

编译好的安装包位于：
```
app/build/outputs/apk/debug/app-debug.apk
```

安装方式：
1. 将 `app-debug.apk` 发送到安卓手机或平板点击安装。
2. 或使用 USB 调试通过电脑安装：
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

## 🛠️ 源码结构与自行编译

- `app/src/main/java/com/dinokids/encyclopedia/`
  - `MainActivity.kt` — 应用入口与页面导航
  - `model/Dinosaur.kt` — 10 种恐龙三语名称与中文科普资料库
  - `audio/DinoSpeaker.kt` — 中/法/英三语 TTS 朗读封装
  - `ui/screens/HomeScreen.kt` — 恐龙分类图鉴首页
  - `ui/screens/DetailScreen.kt` — 恐龙详情页（图鉴 / 3D 切换、三语发音、中文简介）
  - `ui/screens/FullScreenImageScreen.kt` — 全屏双指缩放看图页
  - `ui/screens/FullScreen3DScreen.kt` — 全屏沉浸式 3D 模型页
  - `ui/components/Dino3DWebView.kt` — 基于 `WebViewAssetLoader` 的离线 3D 渲染组件
- `app/src/main/assets/images/` — 10 张高清儿童恐龙绘本插画
- `app/src/main/assets/www/models/` — 10 个高精度离线 `.glb` 3D 模型
- `app/src/main/assets/www/` — 离线 Three.js PBR 3D 渲染引擎 (`dino_viewer.html`, `dinos3d.js`)

命令行编译：
```bash
./gradlew assembleDebug
```

## 🙏 开源 3D 模型致谢 (Credits)

- **霸王龙、三角龙、腕龙、剑龙、棘龙、迅猛龙、无齿翼龙** 3D 模型来自 [Grab3D](https://grab3d.com/)（CC0-1.0 Public Domain）。
- **甲龙**（“甲龙” by pikabobalex）、**副栉龙**（“副栉龙” by htqj寒潭秋镜）、**蛇颈龙**（“Plesiosaure” by leo kerjean）3D 模型来自 [Prehistoric Animal Museum](https://github.com/s010s/prehistoric-animal-museum)（CC BY 4.0）。
- 3D 渲染引擎基于 [Three.js](https://threejs.org/)（MIT License）。

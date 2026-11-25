# 🦕 恐龙乐园 (Dino Kids) — 儿童恐龙图鉴安卓 App

一款专为小朋友打造的离线恐龙科普图鉴 Android 应用（Kotlin + Jetpack Compose + Three.js 3D 交互模型）。

## ✨ 功能特色

- **10 种经典远古生物**：霸王龙、三角龙、腕龙、剑龙、甲龙、棘龙、副栉龙、迅猛龙、无齿翼龙、蛇颈龙，按「肉食恐龙 / 植食恐龙 / 天空与海洋」分类浏览，还支持「随机看」功能。
- **精美儿童绘本风图片**：每种恐龙均配有高清、色彩明快、友善可爱的绘本风插画，全部内置离线可用。
- **360° 可交互 3D 模型**：内置离线 Three.js 3D 引擎，支持单指拖动 360° 旋转、双指缩放、自动旋转、阳光/黄昏光影切换、全屏查看；轻点恐龙或点击「动一动」按钮还会触发专属动作和趣味音效！
- **中 / 法 / 英三语名字与语音朗读**：每只恐龙均展示中文（附拼音）、法语（Français）与英语（English）名称，点击即可调用 Android 原生语音合成（TTS）读出发音。
- **儿童友好中文简介**：专为小朋友编写的生动中文简介、生活时代、食性、趣味大小对比，以及「你知道吗？」科普小彩蛋，支持一键「读给我听」。

## 📱 安装 APK 到安卓手机/平板

编译好的安装包位于：
```
app/build/outputs/apk/debug/app-debug.apk
```

安装方式：
1. 将 `app-debug.apk` 发送到安卓手机或平板（微信/数据线/云盘等），点击安装（如提示未知来源，允许安装即可）。
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
  - `ui/screens/FullScreen3DScreen.kt` — 全屏沉浸式 3D 模型页
  - `ui/components/Dino3DWebView.kt` — 基于 `WebViewAssetLoader` 的离线 3D 渲染组件
- `app/src/main/assets/images/` — 10 张高清儿童恐龙绘本插画
- `app/src/main/assets/www/` — 离线 Three.js 3D 恐龙模型与交互场景 (`dino_viewer.html`, `dinos3d.js`)

命令行编译：
```bash
./gradlew assembleDebug
```

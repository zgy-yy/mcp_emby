# Emby File Manager

一个基于 Vue 3 的媒体文件管理工具，用于按照 Emby 的命名规范整理媒体文件。

## 功能特点

- 📁 文件树形展示
- 🔍 智能文件分析
- 📝 自动重命名建议
- ✅ 批量重命名确认
- 🎯 支持 Emby 命名规范
- 🎬 支持电影、电视剧、动画等多种媒体类型

## 支持的媒体类型

1. 电影命名规则：
   - 格式：`电影名称 (年份)/电影名称 (年份).扩展名`
   - 示例：`The Matrix (1999)/The Matrix (1999).mkv`

2. 电视剧命名规则：
   - 格式：`剧集名称/Season XX/剧集名称 - SXXEYY - 集标题.扩展名`
   - 示例：`Breaking Bad/Season 01/Breaking Bad - S01E01 - Pilot.mkv`

3. 动画剧集命名规则：
   - 格式：`动画名称/Season XX/动画名称 - SXXEYY - 集标题.扩展名`
   - 示例：`Attack on Titan/Season 01/Attack on Titan - S01E01 - To You, in 2000 Years.mkv`

4. 纪录片命名规则：
   - 格式：`纪录片名称/Season XX/纪录片名称 - SXXEYY - 集标题.扩展名`
   - 示例：`Planet Earth/Season 01/Planet Earth - S01E01 - From Pole to Pole.mkv`

5. 音乐视频命名规则：
   - 格式：`艺术家名称/专辑名称/艺术家名称 - 歌曲名称.扩展名`
   - 示例：`Michael Jackson/Thriller/Michael Jackson - Thriller.mkv`

## 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd emby-filem
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 使用说明

1. 启动应用后，在设置页面配置媒体文件目录
2. 进入文件管理页面，选择需要整理的目录
3. 点击"开始处理"按钮，AI 将分析目录结构
4. 查看重命名建议，确认无误后点击"确认"
5. 等待处理完成，查看处理结果

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus (可选)

## 开发说明

- 使用 TypeScript 进行开发
- 遵循 Vue 3 组合式 API 风格
- 使用 Vite 作为构建工具
- 支持热更新和快速开发

## 注意事项

1. 文件夹名称要包含年份（对于电影）
2. 季数使用 "Season XX" 格式（XX 为两位数）
3. 集数使用 "SXXEYY" 格式（XX 为季数，YY 为集数）
4. 集标题要使用英文，避免特殊字符
5. 文件扩展名要小写
6. 避免使用特殊字符，如：\\ / : * ? " < > |
7. 使用空格而不是下划线或点号
8. 多季剧集要放在对应的季文件夹中
9. 删除文件名中的无关信息，如：字幕组信息、分辨率信息、编码信息和网站信息等

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

[MIT License](LICENSE)

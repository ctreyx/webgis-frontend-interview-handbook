---
name: quiz-app-auto-deploy
description: 面试题库 quiz-app 的自动部署与试题同步机制说明。当用户新增/修改/整理面试题（.md 文件）后需要同步线上 GitHub Pages 时使用；也用于排查"线上题库没更新/题数不对/新分类没出现"等问题。涵盖扫描机制、CI/CD 触发条件、操作流程和验证方法。
---

# quiz-app 自动部署与试题同步

> 线上地址：https://ctreyx.github.io/webgis-frontend-interview-handbook/

---

## 一、整体架构（数据流）

```
仓库根目录的 .md 面试题文件
        ↓  ① 构建时扫描
quiz-app/scripts/scan-questions.js
        ↓  ② 生成结构化数据
quiz-app/src/data/questions.ts
        ↓  ③ vite build 打包
quiz-app/dist/
        ↓  ④ GitHub Actions 部署
GitHub Pages（线上题库）
```

**核心机制**：题库不是手动维护的，而是每次构建时自动扫描仓库里所有 `.md` 文件生成的。所以「试题更新 = md 文件更新 + 触发一次构建」。

---

## 二、自动更新机制（已配置，无需手动部署）

CI 工作流 `.github/workflows/deploy-quiz.yml` 已配置为**任何 push 到 main 分支都会自动触发**：

```yaml
on:
  push:
    branches: [main]      # ← 任何 push 都触发
  workflow_dispatch:      # ← 也支持手动触发
```

**结论**：只要 `git commit && git push` 到 main，GitHub Actions 就会自动：
1. `npm install`
2. `npm run build`（内部先跑 `scan-questions.js` 重新扫描 md）
3. 部署 `dist/` 到 GitHub Pages

---

## 三、试题更新操作流程

### 日常整理/新增试题

```bash
# 1. 编辑或新增 md 文件（仓库根目录下的分类文件夹里）
# 2. 提交并推送
git add -A
git commit -m "docs: xxx"
git push origin main
# 3. 等 1-2 分钟，CI 自动扫描部署完成
```

> 不需要手动跑构建，也不需要手动部署。push 即触发。

### 手动触发部署（CI 没自动跑时）

去 Actions 页面手动 run：
https://github.com/ctreyx/webgis-frontend-interview-handbook/actions/workflows/deploy-quiz.yml
点 "Run workflow" → "Run workflow"。

---

## 四、扫描规则（scan-questions.js）

试题扫描脚本：`quiz-app/scripts/scan-questions.js`

| 规则 | 说明 |
|---|---|
| **扫描范围** | 仓库根目录下所有 `.md` 文件（递归） |
| **分类来源** | md 文件所在的**文件夹名** |
| **标题来源** | md 文件第一行的 `# 标题`，没有则用文件名 |
| **跳过文件** | `换肤简历.md`、`简历亮点.md`、`需要学习.md` |
| **分类映射** | 见脚本里 `CATEGORY_NAMES`（文件夹名 → 中文分类名） |

### 新增一个分类的步骤

1. 在仓库根目录新建一个文件夹（如 `新分类/`）
2. 往里面放 `.md` 文件
3. 在 `scan-questions.js` 的 `CATEGORY_NAMES` 里加上映射：
   ```js
   const CATEGORY_NAMES = {
     // ...已有分类
     '新分类': '新分类的中文名',
   }
   ```
4. 提交推送，CI 自动重建

> ⚠️ 不加映射的话，分类名会直接显示文件夹名（可能不友好）。

---

## 五、验证方法

推送后 1-2 分钟，访问线上地址验证：

1. **题数**：首页侧边栏「全部题目」的数字 = 所有 md 文件数（减去跳过的 3 个）
2. **新分类**：侧边栏「分类」列表是否出现新分类
3. **内容**：点进题目看内容是否最新

也可以在本地先验证扫描结果（不部署）：
```bash
npm --prefix quiz-app run scan
# 输出：✅ 扫描完成！共 N 道面试题，M 个分类
```

---

## 六、常见问题排查

| 现象 | 原因 | 解决 |
|---|---|---|
| 线上题数没变 | CI 没触发 / 还在跑 / 失败了 | 去 Actions 页看 run 状态，失败就重跑 |
| 新分类没出现 | 没加 `CATEGORY_NAMES` 映射 | 补映射后重新 push |
| 新文件没被扫到 | 文件不在仓库根目录的文件夹里 | md 文件必须放在根目录下的分类文件夹 |
| 标题不对 | 文件第一行不是 `# 标题` | 第一行改成 markdown 标题 |
| 构建失败 ENOENT | `src/data/` 目录不存在 | 已修复：scan 脚本会 `mkdirSync` 自动创建 |

---

## 七、关键文件清单

| 文件 | 作用 |
|---|---|
| `.github/workflows/deploy-quiz.yml` | CI 部署工作流（push main 即触发） |
| `quiz-app/scripts/scan-questions.js` | md 扫描脚本（分类映射、跳过规则） |
| `quiz-app/src/data/questions.ts` | 扫描生成的结构化数据（自动生成，勿手改） |
| `quiz-app/vite.config.ts` | base 路径（`/webgis-frontend-interview-handbook/`） |
| `quiz-app/src/router.ts` | hash 路由（GitHub Pages 兼容） |

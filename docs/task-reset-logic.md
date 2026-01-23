# 每日任务重置逻辑说明

## 概述

`getTasks()` 函数在 `src/actions/tasks.ts` 中实现了任务的自动重置和清理逻辑。

## 核心逻辑

### 重置时间计算

```typescript
const timezone = 'Asia/Shanghai';
const resetTime = process.env.DAILY_RESET_TIME || '00:00';
```

- 默认在每天 **00:00** (北京时间) 触发重置
- 可通过环境变量 `DAILY_RESET_TIME` 自定义重置时间

### 任务处理规则

| 任务类型 | `isDaily` | `completed` | 每日到期后行为 |
|---------|-----------|-------------|---------------|
| 每日功课 | `true` | 任意 | 进度重置为 0，`completed` 设为 `false` |
| 普通任务 | `false` | `true` | 被删除 |
| 普通任务 | `false` | `false` | 保留不变 |

### 触发条件

重置/清理操作只在满足以下条件时触发：
1. 存在 `updatedAt < 重置阈值` 的任务
2. 该任务是每日任务，或者是已完成的非每日任务

### 流程图

```
用户访问页面
    ↓
getTasks() 被调用
    ↓
计算重置阈值 (Asia/Shanghai 时区)
    ↓
检查是否有需要处理的任务
    ↓
┌─────────────────────────────────────────────────────────┐
│  处理逻辑:                                               │
│  A. 删除: isDaily=false + completed=true + 过期         │
│  B. 重置: isDaily=true + 过期 → current=0               │
└─────────────────────────────────────────────────────────┘
    ↓
返回所有用户任务
```

## "每日功课"标记的含义

- **`isDaily=true`**: 每日功课
  - 每天 00:00 自动重置进度
  - 永不被自动删除
  - 在任务卡片上显示特殊图标

- **`isDaily=false`**: 普通/临时功课
  - 不会被定时重置
  - 完成后，第二天自动删除
  - 未完成则一直保留

## 注意事项

1. **updatedAt 字段**：重置时会更新此字段，防止同一天重复重置
2. **时区处理**：使用 `dayjs` 的时区插件确保在北京时间计算
3. **性能优化**：先用 `findFirst` 检查是否需要操作，避免无谓的写操作

## 相关代码

- 主逻辑: `src/actions/tasks.ts` - `getTasks()`
- 创建任务: `src/actions/tasks.ts` - `createTask()`
- 更新状态: `src/actions/tasks.ts` - `updateTask()`

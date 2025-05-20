FROM --platform=${BUILDPLATFORM:-linux/amd64} node:18-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装依赖
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 构建应用
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 生产环境
FROM base AS runner
ENV NODE_ENV production
ENV PORT 9769

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 如果有public目录，创建它
RUN mkdir -p ./public

# 挂载持久化卷的目录
VOLUME /app/data

# 暴露端口
EXPOSE 9769

# 启动命令
CMD ["node", "server.js"]

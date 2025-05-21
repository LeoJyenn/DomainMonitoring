# 贡献指南

非常感谢您对域名监控系统的兴趣！这个项目旨在提供一个简单易用的域名到期监控工具。我们欢迎任何形式的贡献，包括功能请求、bug报告、代码贡献和文档改进。

## 如何贡献

### 报告Bug或提出功能建议

1. 确保该Bug或功能请求尚未在[Issues](https://github.com/LeoJyenn/DomainMonitoring/issues)中被提出
2. 提交一个新的issue，并尽可能详细地描述问题或建议
3. 对于Bug报告，请提供复现步骤和相关环境信息

### 提交代码

1. Fork本仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交Pull Request

### Pull Request规范

- 清晰描述您的更改内容和目的
- 确保您的代码符合项目的编码风格
- 更新相关文档
- 确保所有测试通过

## 开发环境设置

1. 克隆仓库:
```bash
git clone https://github.com/YourUsername/DomainMonitoring.git
cd DomainMonitoring
```

2. 安装依赖:
```bash
npm install
```

3. 启动开发服务器:
```bash
npm run dev
```

## 代码规范

- 使用TypeScript类型
- 遵循ESLint规则
- 组件使用函数式组件和React Hooks
- 尽量使用现有的UI组件和工具函数

## 版本命名规则

我们遵循[语义化版本](https://semver.org/)，格式为 `主版本号.次版本号.修订号`：

- 主版本号：当进行不兼容的API更改时
- 次版本号：当添加向后兼容的功能时
- 修订号：当进行向后兼容的bug修复时

## 许可证

本项目采用MIT许可证，详情请见[LICENSE](LICENSE)文件。通过贡献代码，您同意您的贡献将在相同的许可下发布。 
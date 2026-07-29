import PrepareKeyForFurtherUse from './common/prepare-key-for-further-use.mdx';

# 通过 Chrome 插件快速体验

通过使用 Midscene.js Chrome 插件，你可以快速在任意网页上体验 Midscene 的主要功能，而无需编写任何代码。

该扩展与 npm `@midscene/web` 包共享了相同的代码，因此你可以将其视为 Midscene 的一个 Playground 或调试工具。

**Prompt** : Sign up for Github, you need to pass the form validation, but don't actually click.

<video src="https://lf3-static.bytednsdoc.com/obj/eden-cn/nupipfups/Midscene/1.0-showcases/github2.mp4" poster="https://lf3-static.bytednsdoc.com/obj/eden-cn/nupipfups/Midscene/1.0-showcases/github.png" height="300" controls />

查看此次任务的完整报告：[report.html](https://lf3-static.bytednsdoc.com/obj/eden-cn/nupipfups/Midscene/1.0-showcases/github.html)

## 安装 Chrome 扩展

<a href="https://chromewebstore.google.com/detail/midscene/gbldofcpkknbggpkmbdaefngejllnief" target="_blank">
  <img src="https://lf3-static.bytednsdoc.com/obj/eden-cn/vhaeh7vhabf/chrome_extension_store_btn.png" width="200" />
</a>

前往 Chrome 扩展商店安装 Midscene 扩展：[Midscene](https://chromewebstore.google.com/detail/midscene/gbldofcpkknbggpkmbdaefngejllnief)

启动扩展（可能默认折叠在 Chrome 扩展列表中），你应该能在浏览器右侧看到名为 “Midscene” 的侧边栏。

## 配置 AI 模型服务

通过环境变量设置模型。选择模型时，请参考[模型策略](/model-strategy.md)。

```bash
export MIDSCENE_MODEL_BASE_URL="https://替换为你的模型服务地址/v1"
export MIDSCENE_MODEL_API_KEY="替换为你的 API Key"
export MIDSCENE_MODEL_NAME="替换为你的模型名称"
export MIDSCENE_MODEL_FAMILY="替换为你的模型系列"
```

全部配置项请参考[模型配置](/model-config.md)。

## 开始体验

完成模型配置后，可以体验以下核心功能：

* **Act**：通过自动规划（Auto Planning）与界面交互，对应 `aiAct`。例如：

```
在搜索框中输入 Midscene，执行搜索，跳转到第一条结果
```

```
填写完整的注册表单，注意主要让所有字段通过校验
```

* **Query**：从界面中提取结构化数据，对应 `aiQuery`。

类似的方法还有 `aiBoolean()`、`aiNumber()` 和 `aiString()`，用于直接提取布尔值、数字和字符串。

```
提取页面中的用户 ID，返回 { id: string } 结构的 JSON 数据
```

* **Assert**：验证界面是否满足指定条件。如果不满足，则抛出错误。该功能对应 `aiAssert`。

```
页面上存在一个登录按钮，它的下方有一个用户协议的链接
```

* **Tap**：通过即时操作（Instant Action）点击元素，对应 `aiTap`。

```
点击登录按钮
```

> 自动规划（Auto Planning）和即时操作（Instant Action）的区别，请参阅[通用 API 参考](/reference.md#common)。

## FAQ

### 是否可以手动安装 Chrome 扩展？

如果无法访问 Chrome 扩展商店，可以从 [Releases](https://github.com/web-infra-dev/midscene/releases) 下载安装包手动安装。但不推荐使用这种方式，因为无法获得自动更新。

### 插件运行失败，提示 'Cannot access a chrome-extension:// URL of different extension'

这一般是与其他插件冲突所致，如页面已经被其他插件注入了 `<iframe />` 或 `<script />`。

找到可疑插件：

1. 打开页面的调试器，找到被其他插件注入的 `<iframe />` 或 `<script />`，一般 URL 是 `chrome-extension://{这串就是ID}/...` 格式，复制其 ID。
2. 打开 `chrome://extensions/`，用 cmd+f 找到相同 ID 的插件，禁用它。
3. 刷新页面，再次尝试。

### 在 Chrome 插件中使用 Ollama 模型出现 403 错误

需要设置环境变量 `OLLAMA_ORIGINS="*"`，以允许 Chrome 插件访问 Ollama 模型。

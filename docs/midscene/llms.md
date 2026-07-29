# Midscene - Vision-Driven UI Automation

> AI-powered, vision-driven UI automation for every platform.

## Other

- [BDD 风格脚本（Gherkin）](./zh/advanced/bdd-style-scripts-with-gherkin.md): 此特性从 Midscene 1.10 开始支持。BDD 相关能力仍处于 Beta 阶段，未来 API 可能发生变化。 Gherkin 是一种用纯文本描述行为示例的语法，常用于 BDD（Behavior-Driven Development，行为驱动开发）流程。一个 BDD 场景通常包含三类步骤：Given 描述前置条件，When 描述用户操作，Then 描述预期结果。 举例来说，当需要测试待办事项页面的新增功能时，可以把用例写成下面的 Gherkin 脚本。 较长的 GUI 用例也可以写在同一个 Scenario 中。你可以按业务阶段组织步骤，每个阶段都使用一组 Given、When、Then。 这种写法适合一个业务 scenario 自然包含多个 UI 阶段的情况，例如购物车确认、配送地址选择、支付和最终确认。 在 AI 通过自然语言驱动 GUI 操作的场景中，Gherkin 很适合描述操作用例。它让脚本保留自然语言的可读性，同时提供稳定的步骤结构。这种结构也有助于模型生成更规范的用例。 Gherkin 的完整语法可以参考官方的 Cucumber Gherkin reference。
- [Midscene AndroidWorld Benchmark 测试报告](./zh/android-world-benchmark-report.md): <BenchmarkReportPreview invalidMessage="无效的 benchmark 报告 URL。" loadingMessage="报告加载中..." titlePrefix="Benchmark 报告" /> 本文是 Midscene 针对 AndroidWorld benchmark 的测试报告。本次测试中，Midscene 取得了 Pass@1 93.10%、Pass@2 95.69%、Pass@3 97.41% 的结果。
- [使用 YAML 格式的自动化脚本](./zh/automate-with-scripts-in-yaml.md): 在大多数情况下，开发者编写自动化脚本只是为了执行一些简单流程，比如检查某些内容是否出现，或者验证某个关键用户路径是否可用。此时维护一个大型测试项目会显得毫无必要。 ⁠Midscene 提供了一种基于 .yaml 文件的自动化测试方法，这有助于你专注于编写流程，而不是测试框架。 这里有一个示例，通过阅读它的内容，你应该已经理解了它的工作原理。
- [Awesome Midscene](./zh/awesome-midscene.md): 基于 Midscene.js 开发的社区项目精选列表，涵盖不同平台和编程语言的扩展功能。
- [即时操作和深度思考](./zh/blog-introducing-instant-actions-and-deep-think.md): 从 Midscene v0.14.0 开始，我们引入了两个新功能：即时操作（Instant Actions）和深度思考（Deep Think）。
- [Chrome 桥接模式（Bridge Mode）](./zh/bridge-mode.md): Midscene Chrome 插件的桥接模式允许你使用本地脚本来控制桌面版 Chrome。脚本既能连接新标签页，也可以附着到当前激活的标签页。 这种方式能复用本地浏览器的 cookies、插件和页面状态，与自动化脚本协作完成任务；在自动化领域也被称作 “man-in-the-loop”。
- [缓存 AI 规划和定位](./zh/caching.md): Midscene 支持缓存两类内容：AI 规划的步骤，以及匹配到的元素定位信息。前者可用于各类自动化任务，以减少 AI 模型调用次数并提升执行效率；后者中的 DOM 元素定位信息（XPath）在 Web 自动化任务中可显著减少重复定位开销，不过目前仅适用于 Web 场景，并且存在一定局限性。 效果 当缓存命中时，脚本的执行时间会显著降低。例如在如下案例中，执行耗时从51秒降低到了28秒。 before after
- [](./zh/common/get-cdp-url.md)
- [](./zh/common/prepare-ios.md)
- [](./zh/common/quick-model-config.md)
- [](./zh/common/setup-env.md)
- [](./zh/common/start-experience.md)
- [](./zh/common/troubleshooting-llm-connectivity.md)
- [解析报告文件](./zh/consume-report-file.md): Midscene 的 HTML 报告文件记录了单个 Agent 运行过程中的完整信息，用以回放和调试。 从 v1.7.0 开始，你可以把报告文件中的原始截图和 JSON 数据提取出来，或者把报告转录为 Markdown，方便其他工具继续消费这些内容。
- [数据隐私](./zh/data-privacy.md): Midscene.js 是一个开源项目（GitHub: Midscene)，遵循 MIT 许可证。你可以在公开仓库中查看到所有代码。 当使用 Midscene.js 时，你的页面数据（包括截图）将直接发送到你配置的 AI 模型提供商。没有第三方平台会访问这些数据。你需要关注的是模型提供商的数据隐私政策。 如果你希望在你自己的环境中构建 Midscene.js 和它的 Chrome 扩展（而不是使用我们已发布的版本），你可以参考 贡献指南 以找到构建说明。
- [常见问题 FAQ](./zh/faq.md)
- [与任意界面集成](./zh/integrate-with-any-interface.md): 你可以使用 Midscene 的 Agent 来控制任意界面，比如 IoT 设备、内部应用、车载显示器等，只需要实现一个符合 AbstractInterface 定义的 UI 操作类。 在实现了 UI 操作类之后，你可以获得 Midscene Agent 的全部特性： TypeScript 的 GUI 自动化 Agent SDK，支持与任意界面集成用于调试的 Playground通过 yaml 脚本控制界面通过 CLI 命令接入 Skills
- [集成到 Playwright](./zh/integrate-with-playwright.md): Playwright.js 是由微软开发的一个开源自动化库，主要用于对网络应用程序进行端到端测试（end-to-end test）和网页抓取。 与 Playwright 的集成方式有以下两种方式： 直接用脚本方式集成和调用 Midscene Agent，适合快速体验、原型开发、数据抓取和自动化脚本等场景。在 Playwright 的测试用例中集成 Midscene，适合需要执行 UI 测试的场景。
- [集成到 Puppeteer](./zh/integrate-with-puppeteer.md): Puppeteer 是一个 Node.js 库，它通过 DevTools 协议或 WebDriver BiDi 提供控制 Chrome 或 Firefox 的高级 API。Puppeteer 默认在无界面模式（headless）下运行，但可以配置为在可见的浏览器模式（headed）中运行。
- [Midscene.js - 视觉驱动的 UI 测试与自动化](./zh/introduction.md): Midscene 是一个用于视觉驱动 UI 测试与自动化的开源 SDK。你用自然语言描述每一步，Midscene 会驱动多模态模型为你规划并操作界面。它覆盖 Web、移动端、桌面端，甚至 <canvas> 场景。
- [LLMs.txt 文档](./zh/llm-txt.md): 如何让 Cursor、Windstatic、GitHub Copilot、ChatGPT 和 Claude 等工具理解 Midscene.js。 我们支持 LLMs.txt 文件，使 Midscene.js 的文档可供大型语言模型使用。
- [MCP 集成已下线](./zh/mcp.md): Midscene 不再发布 MCP server。请改用 Skills，让 AI 编程 Agent 通过各平台 CLI 驱动 Midscene。 如果仍然需要 MCP server 包，请将 Midscene 固定在 1.9.8。这是最后一个包含 MCP 支持的版本。 请从 Agent 配置中移除以下已退役的 MCP 包： @midscene/web-bridge-mcp@midscene/android-mcp@midscene/ios-mcp@midscene/harmony-mcp@midscene/computer-mcp@midscene/mcp 如果之前的 MCP 配置中设置了 MIDSCENE_MCP_CHROME_PATH，请迁移为 Skills 和 CLI 使用的 MIDSCENE_CHROME_PATH。旧变量会暂时作为迁移别名继续生效。 如果需要代码级自动化，请使用 JavaScript SDK、YAML runner，或 Skills 中列出的各平台 CLI。
- [Midscene MobileWorld Benchmark 测试报告](./zh/mobile-world-benchmark-report.md): 本文是 Midscene 针对 MobileWorld benchmark 的测试报告。本次测试覆盖 117 个任务，Midscene 取得了 Pass@1 78.63%（92/117） 的结果。
- [配置你的模型](./zh/model-common-config.md)
- [全部配置项](./zh/model-config.md): Midscene 通过读取操作系统中指定的环境变量来完成配置。 Midscene 默认集成了 OpenAI SDK 调用 AI 服务，它限定了推理服务的参数风格，绝大多数模型服务商（或模型部署工具）都提供了满足这种要求的接口。 本篇文档会重点介绍 Midscene 的模型配置参数。如果你对 Midscene 的模型策略感兴趣，请阅读 模型策略。如果你想查看常用模型的配置示例，请阅读 配置你的模型。
- [模型策略](./zh/model-strategy.md): 本篇文档会重点介绍 Midscene 的模型选用策略。如果你需要进行模型配置，请参考 常用模型配置。
- [Android](./zh/platforms/android.md): Midscene 通过 adb 连接 Android 设备，可自动化 App 和系统界面。 本指南介绍设备连接、模型配置、Playground 体验，以及 @midscene/android 的 JavaScript SDK 集成。
- [桌面端](./zh/platforms/desktop.md): Midscene 通过原生键盘和鼠标控制，在 Windows、macOS 和 Linux 上自动化桌面应用。 本指南介绍平台配置、模型配置、Playground 体验，以及 @midscene/computer 的 JavaScript SDK 集成。
- [HarmonyOS](./zh/platforms/harmonyos.md): Midscene 通过 HarmonyOS Device Connector（HDC）连接 HarmonyOS NEXT 设备，可自动化 App 和系统界面。 本指南介绍设备连接、模型配置、Playground 体验，以及 @midscene/harmony 的 JavaScript SDK 集成。
- [更多平台](./zh/platforms/index.md): 除 Web 浏览器外，Midscene 还支持移动设备、HarmonyOS 设备和桌面应用。请根据目标界面和连接方式选择平台。 Midscene 使用多模态视觉模型理解截图，因此自动化过程面向最终呈现的界面，不依赖底层 UI 结构。同一套方法可以适配原生应用和跨平台技术栈。
- [iOS](./zh/platforms/ios.md): Midscene 通过 WebDriverAgent 连接 iOS 设备，可自动化 App 和系统界面。 本指南介绍 WebDriverAgent 配置、模型配置、Playground 体验，以及 @midscene/ios 的 JavaScript SDK 集成。
- [通过 Chrome 插件快速体验](./zh/quick-experience.md): 通过使用 Midscene.js Chrome 插件，你可以快速在任意网页上体验 Midscene 的主要功能，而无需编写任何代码。 该扩展与 npm @midscene/web 包共享了相同的代码，因此你可以将其视为 Midscene 的一个 Playground 或调试工具。 Prompt : Sign up for Github, you need to pass the form validation, but don't actually click. 查看此次任务的完整报告：report.html
- [快速开始](./zh/quick-start.md): 几分钟内上手 Midscene。有两种开始方式，你可以任选其一先体验： 零代码：安装 Chrome 插件，在任意网页上直接体验 Midscene，无需搭建项目。编写脚本：使用 JavaScript SDK 构建可复用的自动化。 两种方式都需要先配置一个多模态模型，我们先把它准备好。
- [API 参考](./zh/reference/index.md): 本页汇总通用 Agent API，以及各平台专属的构造函数、选项、操作和辅助方法。 本页记录 API 契约。安装、端到端工作流和故障排查请参考对应指南。平台 Agent 默认继承共享 Agent API；平台章节只记录对应环境的构造方式、选项、能力差异和工具。 本页保留少量完整示例，帮助理解相关 API 如何组合使用。更完整的接入流程和最佳实践请参考各章节末尾的指南链接。
- [](./zh/showcases-android.md)
- [](./zh/showcases-computer.md)
- [](./zh/showcases-harmony.md)
- [](./zh/showcases-ios.md)
- [](./zh/showcases-web.md)
- [案例展示](./zh/showcases.md)
- [使用 Skills 控制任意平台](./zh/skills.md): Agent Skills 是一种扩展 AI 编程助手能力的格式。Midscene 提供了 Agent Skills，让 AI 编程工具（如 Claude Code、Cline 等）可以通过 CLI 命令驱动 UI 自动化。 Skills 通过在终端中直接运行 CLI 命令来工作。AI 编程助手充当“大脑”：截图、分析 UI、决定下一步操作。
- [使用 JavaScript 优化 AI 自动化代码](./zh/use-javascript-to-optimize-ai-automation-code.md): 许多开发者喜欢使用 aiAct 或 ai 来执行自动化任务，甚至将所有长段落复杂逻辑描述在一个自然语言指令中。这是很"智能"的做法，但在实际使用中可能遇到无法稳定复现、速度偏慢的问题。 本文为你介绍一种使用 JavaScript 和结构化 API 编写自动化脚本的思路，供开发者参考。
- [YAML 脚本运行器](./zh/yaml-script-runner.md): Midscene 定义了一种 YAML 格式的脚本，方便开发者快速编写自动化脚本，并提供了对应的命令行工具来快速执行这些脚本。 举例来说，你可以编写如下 YAML 格式脚本示例： 并通过一条命令来执行它： 命令行会输出执行进度，并在完成后生成可视化报告。整个运行过程大幅简化了开发者做环境配置的复杂度。 本文将介绍如何使用 Midscene 的命令行工具。关于更多 YAML 格式脚本的内容，可以参考 使用 YAML 格式的自动化脚本。

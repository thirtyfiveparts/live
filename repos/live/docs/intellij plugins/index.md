---
hide_title: true
---

# IntelliJ Platform Plugins

Helpful information when building [IntelliJ Platform Plugins](https://plugins.jetbrains.com/docs/intellij/welcome.html).

## Links

- Docs - https://plugins.jetbrains.com/docs/intellij/welcome.html
- Platform Explorer - https://plugins.jetbrains.com/intellij-platform-explorer
- Forum - https://intellij-support.jetbrains.com/hc/en-us/community/topics

## Tips

### Don't flatten packages in project view

Only setting `Compact middle packages` is best.

### How debugging works?

To debug you have to run a special JetBrains IDE instance (running against a custom JetBrains JVM). If you need to use JavaScript Plugin extension points, this instance must be the "Ultimate" edition rather than the "Community" one. When running the `runIde` gradle task, the correct IDE will be started based upon your configuration in `gradle.properties`.

### My plugin is not loading

Check the flashing exclamation point in the bottom-right corner for runtime errors.

Also check the debug terminal in the project IDE.

### How to reduce the change-restart-wait-test loop?

- Hotswap  
  JVM built-in code reloading
  See [here](https://stackoverflow.com/questions/61083141/when-working-on-a-intellij-plugin-how-do-you-configure-the-plugin-run-configu)
- Custom hot reload  
  Overcomes restriction of JVM code reloading to allow not only method body modification.
  - JRebel - the best but its expensive.
  - [HotSwapAgent + DCEVM](https://github.com/dmitry-zhuravlev/hotswap-agent-intellij-plugin)
- IntelliJ "Dynamic Plugins"  
  Plugins can be automatically reloaded preventing a restart of the entire IDE.
  See [here](https://stackoverflow.com/questions/47191341/intellij-idea-plugin-development-hot-reload).
- [Tools > IDE Scripting engine](https://www.jetbrains.com/help/idea/ide-scripting-console.html)  
  Opens a scratch editor that has access to IntelliJ Platform APIs. Supports JS + Kotlin.
- [Kotlin REPL](https://kotlinlang.org/docs/tutorials/quick-run.html)  
  Running Kotlin code.
- [LivePlugin](https://github.com/dkandalov/live-plugin)  
  Allows coding and running plugins within the IDE. Similar to Scripting engine but allows storing files in a separate tool window and storing multiple files in folders. Adds some convenience functions in the `PluginUtil` class.

#### Hotswap

Will show a message if the change is not supported.

### `settings.gradle.kts`

In `settings.gradle.kts` there should not be space in the name as this is used to generate the IntelliJ modules names.

After modifying this file - update project. There should be an icon. Could also just build project.

You must specify a platform sdk. When you create one, select your current intellij version and then it will ask you to select a JDK version.

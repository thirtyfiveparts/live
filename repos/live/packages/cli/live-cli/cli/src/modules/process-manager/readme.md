# Process Manager

Tracks processes started by live.

# Ideas

##### Can we track processes that are not started by Live?

Could add a `require` statement to all our code. Maybe in `cli-helper` that would attempt to register the process. But what about `docusaurus` and things. Maybe us a `node --require` statement. I think this is too invasive. Would register with a Live monorepo daemon process that manages file watchers too.

Or maybe an env var? We can then read this from process info.

Could look at `procInfo.cmdStr`

Verdict: This is too tricky. Let's just only look at processes started by live.

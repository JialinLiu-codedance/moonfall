# Midscene Skills Upstream

- Repository: `https://github.com/web-infra-dev/midscene-skills.git`
- Fixed commit: `83bf1241d767a150ff801ea6ea8fe7edaec0e96d`
- License: MIT, preserved in `LICENSE.midscene-skills`

## Vendored Files

| Upstream path | Repository path | Git blob |
|---|---|---|
| `skills/browser/SKILL.md` | `.agents/skills/browser/SKILL.md` | `b5e3a2a21f84015d106dfcb0155ad4c795a606de` |
| `skills/computer-automation/SKILL.md` | `.agents/skills/computer-automation/SKILL.md` | `102613fafc799292f62b29452494df9a459bda93` |

The two official files are vendored byte-for-byte. Repository-specific orchestration belongs only in `midscene-tdd`.

Do not add Android, iOS, HarmonyOS, or `vitest-midscene-e2e` skills as part of this integration. Any upgrade requires a new confirmed OpenSpec change, an upstream diff review, and updated commit and blob values.

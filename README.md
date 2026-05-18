# renovate-config

Centralized Renovate configuration for Niceplace repositories.

## What's in this repo

| Path | Purpose |
|---|---|
| `renovate-presets/default.json5` | Shared preset covering Docker, GitHub Actions, Python, Node.js/Bun, Concourse CI |
| `renovate-config.js` | Self-hosted Renovate global config (lists all repos to process) |
| `.github/workflows/renovate.yml` | Scheduled workflow that processes all repos (Wednesdays 10:00 UTC) |
| `.github/workflows/renovate-config-validator.yml` | Validates config on changes (reusable) |

## How to add Renovate to a new repository

1. Add the repo to `repositories` in `renovate-config.js`
2. Create `.github/renovate.json5` in the target repo:

```json5
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>Niceplace/renovate-config//renovate-presets/default.json5"]
}
```

That's it. No workflow needed in the target repo.

## What the centralized preset handles

- **Docker**: digest pinning for docker-compose & Dockerfile
- **GitHub Actions**: SHA pinning, grouped updates
- **Python** (pep621/uv): minor/patch automerge
- **Node.js/Bun** (npm): minor/patch automerge
- **Concourse CI**: custom regex manager for Docker images in task/pipeline YAML
- **Safeguards**: major updates never automerged, 7-day minimum release age for majors

# Frontend Web

Phase 1 dashboard shell package.

## Development

```bash
npm run dev
```

The dashboard tries to read live insights data from `http://127.0.0.1:4105/v1/insights/dashboard?siteId=demo-site`.
If the insights API is unavailable, the page falls back to mocked KPI data so UI development can continue.

# GitHub Issues Similarity Dashboard

This dashboard visualizes GitHub issues based on their content similarity using embeddings and clustering.

```js
import {IssuesMap} from "./components/issues-map.js"
```

```js
const githubIssues = await FileAttachment("./data/issues.json").json();
```

```js
const projectedData = githubIssues.map(d => ({
  ...d,
  embeddings: d.embeddings?.slice(0, 2) ?? [0, 0]
})).filter(d => d.embeddings.every(n => Number.isFinite(n)))
```

```js
IssuesMap(projectedData)
```

```js
Inputs.table(githubIssues)
```

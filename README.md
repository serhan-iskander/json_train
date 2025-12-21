# Train-Ticket Graph API

A Next.js API that loads the Train-Ticket microservice graph and computes all possible routes with security metadata. It supports filtering via a JSON query expression and returns a compact result for exploration.

## Overview

- Loads input graph from [public/train-ticket-be.json](public/train-ticket-be.json) using [`buildGraph`](app/service/ServiceGraph/grapBuilder.ts)(and sets the route ends with sink and/or have a vulnerability in one of the nodes.).
- Applies filters to the graph using [`filter`](app/service/ServiceGraph/resultsFilter.ts).
- Computes route results via [`buildResults`](app/service/ServiceGraph/resultsBuilder.ts) for circular dependencies and helping the UI.
- Exposes an HTTP API implemented in [app/api/route.ts](app/api/route.ts).

## Tech Stack

- Next.js (App Router)
- React
- TypeScript

## Installation

- pnpm:
  - `pnpm install`
- npm:
  - `npm install`

## Running

- Dev:
  - `pnpm dev` or `npm run dev`
  - Open `http://localhost:3000`
- Build & Start:
  - `pnpm build && pnpm start` or `npm run build && npm start`

## API

- Endpoint: `GET /api`

### Query Parameters

- `query` (optional): a simple filter string parsed by [`filter`](app/service/ServiceGraph/resultsFilter.ts). No JSONQuery is used.
  - Examples:
    - No filter: `/api`
    - Filter by vulnerability: `/api?query=hasVulnerability=true`
    - Filter by name contains: `/api?query=name=service`
    - Filter by child service name contains: `/api?query=to=name>basic`


### Response

- Success:
  - Status 200
  - Body:
    ```json
    {
      "status": "success",
      "result": { /* output of buildResults(filteredGraph) */ }
    }
    ```
- Error:
  - Status 500
  - Body:
    ```json
    {
      "status": "error",
      "result": "message"
    }
    ```

## Architecture

- Graph loader: [`buildGraph`](app/service/ServiceGraph/grapBuilder.ts)
- Route computation: [`buildResults`](app/service/ServiceGraph/resultsBuilder.ts)
- Filtering: [`filter`](app/service/ServiceGraph/resultsFilter.ts)
- Node model: [app/service/ServiceGraph/serviceNode.ts](app/service/ServiceGraph/serviceNode.ts)
- API route: [app/api/route.ts](app/api/route.ts)

The API route reads the graph file, builds the in-memory graph once, and on each request:
1. Parses `query` (if provided).
2. Applies [`filter`](app/service/ServiceGraph/resultsFilter.ts) to the graph.
3. Returns the output of [`buildResults`](app/service/ServiceGraph/resultsBuilder.ts).

## Assumptions

- Graph data:
  - Nodes have a unique `name`.
  - Edges are directed and defined via each node’s `to` list of target node names.
  - Cycles may exist; `buildResults` detects circular dependencies.
- Route semantics:
  - Routes are paths through the directed graph.
  - A route terminates at a sink node (no `to`).
- Query behavior:
  - The `query` string supports simple equality and containment checks implemented in `resultsFilter.ts`.
  - `name=foo` matches nodes whose name contains `foo`.
  - `hasVulnerability=true` matches routes that include vulnerable nodes.
  - `to=name>bar` matches routes where a target node’s name contains `bar`.
- API/runtime:
  - Graph is loaded from `public/train-ticket-be.json` and cached per server process.
  - Only `GET /api` is supported; request bodies are ignored.
  - Requires Node.js 18+ with Next.js App Router and TypeScript.
- Performance:
  - Route enumeration can grow quickly with branching and cycles; prefer filtering first on large graphs.


## Notes

- Input graph source: [public/train-ticket-be.json](public/train-ticket-be.json)
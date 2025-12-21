import type { serviceNode } from './serviceNode';

function normalizeToArray(to: string | string[]): string[] {
    return Array.isArray(to) ? to : [to];
}

export function buildGraph(data: string): Map<string, serviceNode> {
    const graph = initGraph(data);
    setGraphRoutes(graph);
    return graph;
}

function setGraphRoutes(graph: Map<string, serviceNode>): void {
    // Reset flags (do not touch foundPath)
    for (const node of graph.values()) {
        node.startWithPublic = false;
        node.endWithSink = false;
        node.hasVulnerability = false;
    }

    const sinkKinds = new Set(['rds', 'sql', 'database', 'db']);
    const isSink = (n: serviceNode) => sinkKinds.has((n.kind || '').toLowerCase());
    const hasVuln = (n: serviceNode) => Array.isArray(n.vulnerabilities) && n.vulnerabilities.length > 0;

    // DFS
    for (const start of graph.values()) {
        const path: serviceNode[] = [];
        const visit = (current: serviceNode, seen: Set<string>) => {
            path.push(current);
            seen.add(current.name);
            const currentPathHasVuln = hasVuln(current);

            if (isSink(current)) {
                for (const n of path) {
                    n.endWithSink = true;
                    if (currentPathHasVuln) {
                        n.hasVulnerability = true;
                    }
                }
            } else {
                if (currentPathHasVuln) {
                    for (const n of path) {
                        n.hasVulnerability = true;
                    }
                }
                for (const next of current.to ?? []) {
                    if (!seen.has(next.name)) {
                        visit(next, seen);
                    }
                }
            }

            path.pop();
            seen.delete(current.name);
        };

        visit(start, new Set<string>());
    }
}

function initGraph(data: string): Map<string, serviceNode> {
    const parsed = JSON.parse(data);
    const nodeMap = new Map<string, serviceNode>();

    for (const node of parsed.nodes ?? []) {
        const currentNode: serviceNode = {
            name: node.name,
            kind: node.kind as serviceNode['kind'],
            language: node.language ?? 'unknown',
            path: node.path ?? '',
            publicExposed: node.publicExposed ?? false,
            vulnerabilities: node.vulnerabilities ?? [],
            to: [],
            alreadyIncluded: false,
            foundPath: '',
        };
        nodeMap.set(currentNode.name, currentNode);
    }

    // Connect edges
    for (const edge of parsed.edges ?? []) {
        const fromNode = nodeMap.get(edge.from);
        if (!fromNode) {
            // Skip edges with unknown source
            continue;
        }

        for (const targetName of normalizeToArray(edge.to)) {
            const targetNode = nodeMap.get(targetName);
            if (!targetNode) {
                // Skip dangling edges pointing to missing nodes
                continue;
            }
            // Avoid duplicate links
            if (!fromNode.to?.some(t => t.name === targetNode.name)) {
                fromNode.to?.push(targetNode);
            }
        }
    }

    return nodeMap;
}
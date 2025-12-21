import { serviceNode } from './serviceNode';

export function buildResults(map: serviceNode[]): serviceNode[] {
    const results: serviceNode[] = [];
    const foundPaths = new Map<string, string>();

    for (const node of map) {
        const clonedRoot = cloneNode(node);
        results.push(clonedRoot);
        addToFound(foundPaths, clonedRoot, results, node.name);
    }

    return results;
}

function cloneNode(node: serviceNode): serviceNode {
    return {
        name: node.name,
        kind: node.kind,
        language: node.language,
        path: node.path,
        publicExposed: node.publicExposed,
        vulnerabilities: node.vulnerabilities ? [...node.vulnerabilities] : [],
        to: node.to ? [...node.to.map(cloneNode)] : [],
        alreadyIncluded: node.alreadyIncluded,
        foundPath: node.foundPath,
        startWithPublic: node.startWithPublic,
        endWithSink: node.endWithSink,
        hasVulnerability: node.hasVulnerability,
    };
}

function buildPathways(node: serviceNode, foundPaths: Map<string, string>, path: string, results: serviceNode[] = []): void {
    if (!node.to || node.to.length === 0) {
        return;
    }

    for (const child of node.to) {
        const childPath = `${path}->${child.name}`;
        addToFound(foundPaths, child, results, childPath);
    }
}

function addToFound(foundPaths: Map<string, string>, node: serviceNode, results: serviceNode[], path: string) {
    if (!foundPaths.has(node.name)) {
        foundPaths.set(node.name, path);
        buildPathways(node, foundPaths, path);
    } else {
        node.foundPath = foundPaths.get(node.name) || '';
        node.alreadyIncluded = true;
        node.to = [];
    }
}


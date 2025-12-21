import { buildGraph } from './grapBuilder';
import type { serviceNode } from './serviceNode';

describe('buildGraph', () => {
    it('should build a graph with correct nodes and edges', () => {
        const data = JSON.stringify({
            nodes: [
                { name: 'A', kind: 'api' },
                { name: 'B', kind: 'service' },
                { name: 'C', kind: 'db' }
            ],
            edges: [
                { from: 'A', to: 'B' },
                { from: 'B', to: 'C' }
            ]
        });

        const graph = buildGraph(data);

        expect(graph.size).toBe(3);
        expect(graph.get('A')?.to?.[0].name).toBe('B');
        expect(graph.get('B')?.to?.[0].name).toBe('C');
    expect(graph.get('C')?.to?.length).toBe(0);
    });

    it('should set endWithSink for nodes leading to a sink', () => {
        const data = JSON.stringify({
            nodes: [
                { name: 'A', kind: 'api' },
                { name: 'B', kind: 'service' },
                { name: 'C', kind: 'db' }
            ],
            edges: [
                { from: 'A', to: 'B' },
                { from: 'B', to: 'C' }
            ]
        });

        const graph = buildGraph(data);

        expect(graph.get('A')?.endWithSink).toBe(true);
        expect(graph.get('B')?.endWithSink).toBe(true);
        expect(graph.get('C')?.endWithSink).toBe(true);
    });

    it('should set hasVulnerability for nodes on a path with vulnerabilities', () => {
        const data = JSON.stringify({
            nodes: [
                { name: 'A', kind: 'api' },
                { name: 'B', kind: 'service', vulnerabilities: ['vuln1'] },
                { name: 'C', kind: 'db' }
            ],
            edges: [
                { from: 'A', to: 'B' },
                { from: 'B', to: 'C' }
            ]
        });

        const graph = buildGraph(data);

        expect(graph.get('A')?.hasVulnerability).toBe(true);
        expect(graph.get('B')?.hasVulnerability).toBe(true);
        expect(graph.get('C')?.hasVulnerability).toBe(false);
    });

    it('should set hasVulnerability for sink nodes on a path with vulnerabilities', () => {
        const data = JSON.stringify({
            nodes: [
                { name: 'A', kind: 'api' },
                { name: 'B', kind: 'rds', vulnerabilities: ['vuln1'] },
                { name: 'C', kind: 'db' }
            ],
            edges: [
                { from: 'A', to: 'B' },
                { from: 'B', to: 'C' }
            ]
        });

        const graph = buildGraph(data);

        expect(graph.get('A')?.hasVulnerability).toBe(true);
        expect(graph.get('B')?.hasVulnerability).toBe(true);
        expect(graph.get('C')?.hasVulnerability).toBe(false);
    });


    it('should handle missing edges gracefully', () => {
        const data = JSON.stringify({
            nodes: [
                { name: 'A', kind: 'api' },
                { name: 'B', kind: 'service' }
            ],
            edges: [
                { from: 'A', to: 'B' },
                { from: 'B', to: 'C' } // C does not exist
            ]
        });

        const graph = buildGraph(data);

        expect(graph.size).toBe(2);
        expect(graph.get('A')?.to?.[0].name).toBe('B');
        expect(graph.get('B')?.to?.length).toBe(0);
    });

    it('should handle empty input', () => {
        const data = JSON.stringify({ nodes: [], edges: [] });
        const graph = buildGraph(data);
        expect(graph.size).toBe(0);
    });

    it('should handle circular references', () => {
        const data = JSON.stringify({
            nodes: [
                { name: 'A', kind: 'api' },
                { name: 'B', kind: 'service' },
                { name: 'C', kind: 'db' }
            ],
            edges: [
                { from: 'A', to: 'B' },
                { from: 'B', to: 'C' },
                { from: 'C', to: 'A' } // Circular reference
            ]
        });

        const graph = buildGraph(data);

        expect(graph.size).toBe(3);
        expect(graph.get('A')?.to?.[0].name).toBe('B');
        expect(graph.get('B')?.to?.[0].name).toBe('C');
        expect(graph.get('C')?.to?.[0].name).toBe('A');
    });
});
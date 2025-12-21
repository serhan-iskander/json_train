import { filter } from './resultsFilter';

// Mock serviceNode type
type serviceNode = {
    name?: string;
    status?: string;
    version?: number;
    active?: boolean;
    tags?: string[];
    details?: {
        owner?: string;
        region?: string;
    };
    vulnerabilities?: { type: string; severity: string }[];
};

function makeMap(nodes: serviceNode[]): Map<string, serviceNode> {
    return new Map(nodes.map((n, i) => [String(i), n]));
}

describe('filter', () => {
    const nodes: serviceNode[] = [
        {
            name: 'ServiceA',
            status: 'running',
            version: 1,
            active: true,
            tags: ['api', 'core'],
            details: { owner: 'Alice', region: 'us-east' },
            vulnerabilities: [{ type: 'sql', severity: 'high' }]
        },
        {
            name: 'ServiceB',
            status: 'stopped',
            version: 2,
            active: false,
            tags: ['worker'],
            details: { owner: 'Bob', region: 'eu-west' },
            vulnerabilities: [{ type: 'xss', severity: 'low' }]
        },
        {
            name: 'ServiceC',
            status: 'running',
            version: 3,
            active: true,
            tags: ['api'],
            details: { owner: 'Carol', region: 'us-west' },
            vulnerabilities: []
        }
    ];

    const data = makeMap(nodes);

    it('returns all nodes when query is undefined', () => {
        expect(filter(data)).toEqual(nodes);
    });

    it('returns all nodes when query is empty', () => {
        expect(filter(data, '')).toEqual(nodes);
    });

    it('filters by string property', () => {
        const result = filter(data, 'status=running');
        expect(result).toEqual([nodes[0], nodes[2]]);
    });

    it('filters by number property', () => {
        const result = filter(data, 'version=2');
        expect(result).toEqual([nodes[1]]);
    });

    it('filters by boolean property', () => {
        const result = filter(data, 'active=true');
        expect(result).toEqual([nodes[0], nodes[2]]);
    });

    it('filters by nested object property', () => {
        const result = filter(data, 'details=alice');
        expect(result).toEqual([nodes[0]]);
    });

    it('filters by vulnerabilities array with > syntax', () => {
        const result = filter(data, 'vulnerabilities=type>sql');
        expect(result).toEqual([nodes[0]]);
    });

    it('returns all nodes if query is malformed', () => {
        expect(filter(data, 'status')).toEqual(nodes);
        expect(filter(data, '=running')).toEqual(nodes);
        expect(filter(data, 'status=')).toEqual(nodes);
    });

    it('returns empty array if no match', () => {
        expect(filter(data, 'name=notfound')).toEqual([]);
    });
});
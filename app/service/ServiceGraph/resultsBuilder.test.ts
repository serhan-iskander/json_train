import { buildResults } from './resultsBuilder';
import { serviceNode } from './serviceNode';

describe('buildResults', () => {
    it('should return an empty array when input is empty', () => {
        const result = buildResults([]);
        expect(result).toEqual([]);
    });

    it('should clone a single node correctly', () => {
        const node: serviceNode = {
            name: 'A',
            kind: 'service',
            language: 'typescript',
            path: '/A',
            publicExposed: false,
            vulnerabilities: [],
            to: [],
            alreadyIncluded: false,
            foundPath: '',
            startWithPublic: false,
            endWithSink: false,
            hasVulnerability: false,
        };
        const result = buildResults([node]);
        expect(result.length).toBe(1);
        expect(result[0]).not.toBe(node);
        expect(result[0].name).toBe('A');
        expect(result[0].to).toEqual([]);
    });

    it('should clone nodes with children and set foundPath for repeated nodes', () => {
        const nodeB: serviceNode = {
            name: 'B',
            kind: 'service',
            language: 'typescript',
            path: '/B',
            publicExposed: false,
            vulnerabilities: [],
            to: [],
            alreadyIncluded: false,
            foundPath: '',
            startWithPublic: false,
            endWithSink: false,
            hasVulnerability: false,
        };
        const nodeA: serviceNode = {
            name: 'A',
            kind: 'service',
            language: 'typescript',
            path: '/A',
            publicExposed: false,
            vulnerabilities: [],
            to: [nodeB],
            alreadyIncluded: false,
            foundPath: '',
            startWithPublic: false,
            endWithSink: false,
            hasVulnerability: false,
        };
        // B is referenced twice
        const nodeC: serviceNode = {
            name: 'C',
            kind: 'service',
            language: 'typescript',
            path: '/C',
            publicExposed: false,
            vulnerabilities: [],
            to: [nodeB],
            alreadyIncluded: false,
            foundPath: '',
            startWithPublic: false,
            endWithSink: false,
            hasVulnerability: false,
        };

        const result = buildResults([nodeA, nodeC]);
        expect(result.length).toBe(2);
        // Node B should be marked as alreadyIncluded in the second reference
        const bFromA = result[0].to[0];
        const bFromC = result[1].to[0];
        expect(bFromA.name).toBe('B');
        expect(bFromA.alreadyIncluded).toBeFalsy();
        expect(bFromC.name).toBe('B');
        expect(bFromC.alreadyIncluded).toBeTruthy();
        expect(typeof bFromC.foundPath).toBe('string');
    });

    it('should handle nodes with vulnerabilities and preserve them', () => {
        const node: serviceNode = {
            name: 'VulnNode',
            kind: 'service',
            language: 'typescript',
            path: '/VulnNode',
            publicExposed: true,
            vulnerabilities: ['SQL Injection'],
            to: [],
            alreadyIncluded: false,
            foundPath: '',
            startWithPublic: true,
            endWithSink: false,
            hasVulnerability: true,
        };
        const result = buildResults([node]);
        expect(result[0].vulnerabilities).toEqual(['SQL Injection']);
        expect(result[0].hasVulnerability).toBe(true);
    });
});
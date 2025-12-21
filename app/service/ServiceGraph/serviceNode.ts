
class UIData {
    alreadyIncluded: boolean = false;
    foundPath: string = '';
}

class extraData extends UIData {
    startWithPublic?: boolean;
    endWithSink?: boolean;
    hasVulnerability?: boolean;
}

export class serviceNode extends extraData {
    name: string = '';
    kind: string = '';
    language: string = '';
    path: string = '';
    publicExposed?: boolean;
    vulnerabilities?: Vulnerability[];
    to?: serviceNode[];
};



export type Vulnerability = {
    file: string;
    severity: string;
    message: string;
    metadata: Metadata;
};

export type Metadata = {
    [key: string]: any;
};

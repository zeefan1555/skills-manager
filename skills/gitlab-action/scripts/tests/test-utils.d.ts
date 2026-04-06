export type RunResult = {
    stdout: string;
    stderr: string;
    exitCode: number | null;
};
export declare const testData: {
    reviewStatus: {
        repoPath: string;
        mergeRequestId: string;
    };
    runnerLog: {
        jobRunId: string;
        jobRunSeq: string;
    };
    diffByUrl: {
        mergeRequestUrl: string;
    };
    checkRun: {
        checkRunId: string;
        repoPath: string;
        branch: string;
    };
    mergeRequest: {
        create: {
            sourceBranch: string;
            targetBranch: string;
            title: string;
            repoPath: string;
        };
        close: {
            repoPath: string;
        };
    };
};
export declare function isTestDataReady(values: Array<string | number | undefined>): boolean;
export declare function runCommand(args: string[]): Promise<RunResult>;

import type { Command } from 'commander';
import type { CommandExecutor } from '../utils/cli-utils';
type RunnerLogInput = {
    jobRunId?: string;
    jobRunSeq?: string | number;
    pipelineRunId?: string | number;
    stepId?: string;
    stepName?: string;
    stepIndex?: string | number;
    allSteps?: boolean;
    tailLines?: string | number;
    pageSize?: string | number;
};
export declare function getRunnerLog(input: RunnerLogInput): Promise<Record<string, unknown>>;
export declare function registerRunnerLogCommands(program: Command, execute: CommandExecutor): void;
export {};

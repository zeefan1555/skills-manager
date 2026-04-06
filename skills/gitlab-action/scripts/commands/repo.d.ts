import type { NextCode } from '@vecode-fe/nextbeaker-api';
import type { Command } from 'commander';
import type { CommandExecutor } from '../utils/cli-utils';
export declare function getCurrentBranchInfo(): Promise<{
    branch: string;
}>;
export declare function getRepoNameInfo(): Promise<{
    repoPath: string;
}>;
export declare function getRepositoryInfo(nextcode: NextCode, repoPathInput?: string, withPermissionsInput?: string): Promise<unknown>;
export declare function updateRepositoryInfo(nextcode: NextCode, repoPathInput?: string, name?: string, description?: string): Promise<unknown>;
export declare function registerRepoCommands(program: Command, nextcode: NextCode, execute: CommandExecutor): void;

import type { NextCode } from '@vecode-fe/nextbeaker-api';
import type { Command } from 'commander';
import type { CommandExecutor } from '../utils/cli-utils';
export declare function getDefaultBranch(nextcode: NextCode, repoPathInput?: string): Promise<unknown>;
export declare function createBranch(nextcode: NextCode, name: string | undefined, revision: string | undefined, repoPathInput?: string): Promise<unknown>;
export declare function listBranches(nextcode: NextCode, query?: string, pageNumberInput?: string, pageSizeInput?: string, repoPathInput?: string): Promise<unknown>;
export declare function deleteBranch(nextcode: NextCode, name: string | undefined, repoPathInput?: string): Promise<unknown>;
export declare function registerBranchCommands(program: Command, nextcode: NextCode, execute: CommandExecutor): void;

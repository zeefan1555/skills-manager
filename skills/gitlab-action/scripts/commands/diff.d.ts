import type { NextCode } from '@vecode-fe/nextbeaker-api';
import type { Command } from 'commander';
import type { CommandExecutor } from '../utils/cli-utils';
export declare function listDiffCommits(nextcode: NextCode, fromCommit: string | undefined, toCommit: string | undefined, isStraightInput?: string, pageNumberInput?: string, pageSizeInput?: string, withTotalCountInput?: string, repoPathInput?: string): Promise<unknown>;
export declare function listDiffFiles(nextcode: NextCode, fromCommit: string | undefined, toCommit: string | undefined, isStraightInput?: string, rawStatOnlyInput?: string, repoPathInput?: string): Promise<unknown>;
export declare function listDiffFileContents(nextcode: NextCode, fromCommit: string | undefined, toCommit: string | undefined, isStraightInput?: string, filesInput?: string, ignoreWhitespacesInput?: string, contextInput?: string, maxPatchBytesInput?: string, repoPathInput?: string): Promise<unknown>;
export declare function listDiffFileContentsByBranch(nextcode: NextCode, sourceBranchInput: string | undefined, isStraightInput?: string, filesInput?: string, ignoreWhitespacesInput?: string, contextInput?: string, maxPatchBytesInput?: string, targetBranch?: string, repoPathInput?: string): Promise<unknown>;
export declare function listDiffFileContentsByUrl(nextcode: NextCode, mergeRequestUrl: string | undefined, isStraightInput?: string, filesInput?: string, ignoreWhitespacesInput?: string, contextInput?: string, maxPatchBytesInput?: string): Promise<unknown>;
export declare function registerDiffCommands(program: Command, nextcode: NextCode, execute: CommandExecutor): void;

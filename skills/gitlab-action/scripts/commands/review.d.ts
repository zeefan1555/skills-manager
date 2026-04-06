import type { NextCode } from '@vecode-fe/nextbeaker-api';
import type { Command } from 'commander';
import type { CommandExecutor } from '../utils/cli-utils';
export declare function createReview(nextcode: NextCode, mergeRequestId: string | undefined, commitId: string | undefined, statusInput: string | undefined, content?: string, resetApprovalAfterReworkInput?: string, publishDraftCommentsInput?: string, repoPathInput?: string): Promise<unknown>;
export declare function updateReviewers(nextcode: NextCode, mergeRequestId: string | undefined, addReviewerIdsInput?: string, removeReviewerIdsInput?: string, repoPathInput?: string): Promise<unknown>;
export declare function getReviewStatus(nextcode: NextCode, mergeRequestId: string | undefined, repoPathInput?: string): Promise<unknown>;
export declare function registerReviewCommands(program: Command, nextcode: NextCode, execute: CommandExecutor): void;

import { Command } from 'commander';
import { NextCode } from '@vecode-fe/nextbeaker-api';
import type { NextCodeOptions } from '@vecode-fe/nextbeaker-api';
import { type CommandExecutor } from './utils/cli-utils';
export declare const nextcodeOptions: NextCodeOptions;
export declare const nextcode: NextCode;
export declare const program: Command;
export declare const execute: CommandExecutor;
export declare function run(): Promise<void>;

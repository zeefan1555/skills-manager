export type CommandExecutor = (handler: () => Promise<unknown>) => Promise<void>;
export declare function requireArg(value: string | undefined, name: string): string;
export declare function parseBoolean(value: string | undefined, fallback?: boolean): boolean | undefined;
export declare function parseNumber(value: string | undefined, name: string): number | undefined;
export declare function parsePositiveInt(value: string | undefined, name: string, range?: {
    min?: number;
    max?: number;
}): number | undefined;
export declare function parseCsv(value: string | undefined): string[] | undefined;
export declare function unwrapResult<T>(response: unknown): T;
export declare function printResult(result: unknown): void;

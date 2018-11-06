declare global {
    namespace androme.lib {
        namespace base {
            export interface Container<T> extends Iterable<T> {
                readonly list: T[];
                readonly length: number;
                [Symbol.iterator](): Iterator<T>;
                item(index?: number, value?: T): T | undefined;
                append(item: T): void;
                remove(item: T): T[];
                replace(item: T[]): void;
                contains(item: T): boolean;
                duplicate(): T[];
                clear(): this;
                each(predicate: IteratorPredicate<T, void>): this;
                find(predicate: string | IteratorPredicate<T, boolean>, value?: any): T | undefined;
                filter(predicate: IteratorPredicate<T, void>): T[];
                map<U>(predicate: IteratorPredicate<T, U>): U[];
                every(predicate: IteratorPredicate<T, boolean>): boolean;
                some(predicate: IteratorPredicate<T, boolean>): boolean;
                sort(predicate: (a: T, b: T) => number): this;
            }

            export class Container<T> implements Container<T> {
                public constructor(children?: T[]);
            }
        }
    }
}

export {};
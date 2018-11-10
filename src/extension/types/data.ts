interface Inheritable {
    inherit: boolean;
}

export interface CssGridData<T> {
    children: Set<T>;
    rows: T[][];
    rowCount: number;
    rowGap: number;
    rowUnit: string[];
    rowAuto: string[];
    rowName: ObjectMap<number[]>;
    columnCount: number;
    columnGap: number;
    columnUnit: string[];
    columnAuto: string[];
    columnName: ObjectMap<number[]>;
}

export interface CssGridCellData {
    rowStart: number;
    rowSpan: number;
    columnStart: number;
    columnSpan: number;
}

export type GridData = {
    columnEnd: number[];
    columnCount: number;
    padding: BoxRect;
};

export interface GridCellData extends Inheritable {
    rowSpan: number;
    columnSpan: number;
    index: number;
    cellFirst: boolean;
    cellLast: boolean;
    rowEnd: boolean;
    rowStart: boolean;
}

export type ListData = {
    ordinal: string;
    imageSrc: string;
    imagePosition: string;
};
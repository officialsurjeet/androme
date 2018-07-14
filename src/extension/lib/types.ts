import { BoxRect, Inheritable } from '../../lib/types';

export interface GridData {
    columnEnd: number[];
    columnCount: number;
    padding: BoxRect;
}

export interface GridCellData extends Inheritable {
    rowSpan: number;
    columnSpan: number;
    index: number;
    cellFirst: boolean;
    cellLast: boolean;
    rowEnd: boolean;
    rowStart: boolean;
}
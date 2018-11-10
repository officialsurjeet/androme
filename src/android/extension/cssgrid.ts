import { CssGridCellData, CssGridData } from '../../extension/types/data';

import View from '../view';

import $const = androme.lib.constant;
import $util = androme.lib.util;

export default class <T extends View> extends androme.lib.base.extensions.CssGrid<T> {
    public processChild(): ExtensionResult {
        const node = this.node as T;
        const parent = this.parent as T;
        const mainData: CssGridData<T> = parent.data($const.EXT_NAME.CSS_GRID, 'mainData');
        const cellData: CssGridCellData = node.data($const.EXT_NAME.CSS_GRID, 'cellData');
        if (mainData && cellData) {
            let width = 0;
            let minWidth = 0;
            let columnWeight = 0;
            for (let i = 0, j = 0; i < cellData.columnSpan; i++) {
                let value = mainData.columnUnit[cellData.columnStart + i];
                if (!$util.hasValue(value)) {
                    if (mainData.columnAuto[j] !== undefined) {
                        value = mainData.columnAuto[j];
                        if (mainData.columnAuto[j + 1]) {
                            j++;
                        }
                    }
                    else {
                        continue;
                    }
                }
                if ($util.isPercent(value)) {
                    columnWeight += parseInt(value) / 100;
                    minWidth = width;
                    width = 0;
                }
                else if (value.indexOf('fr') !== -1) {
                    columnWeight += parseInt(value);
                    minWidth = width;
                    width = 0;
                }
                else {
                    const widthGap = parseInt(value);
                    if (minWidth === 0) {
                        width += widthGap;
                    }
                    else {
                        minWidth += widthGap;
                    }
                }
            }
            if (cellData.columnSpan > 1) {
                const value = (cellData.columnSpan - 1) * mainData.columnGap;
                if (minWidth === 0) {
                    width += value;
                }
                else {
                    minWidth += value;
                }
            }
            node.android('layout_row', cellData.rowStart.toString());
            if (cellData.rowSpan > 1) {
                node.android('layout_rowSpan', cellData.rowSpan.toString());
                node.android('layout_gravity', 'fill_vertical');
            }
            node.android('layout_column', cellData.columnStart.toString());
            if (cellData.columnSpan > 1) {
                node.android('layout_columnSpan', cellData.columnSpan.toString());
            }
            if (width > 0 && !node.has('width')) {
                node.css('width', $util.formatPX(width));
            }
            if (minWidth > 0 && !node.has('minWidth')) {
                node.css('minWidth', $util.formatPX(minWidth));
            }
            node.android('layout_columnWeight', columnWeight > 0 ? columnWeight.toString() : '0');
        }
        return { output: '', complete: true };
    }
}
import { GridCellData, GridData } from './types/data';

import { BOX_STANDARD, NODE_ALIGNMENT } from '../lib/enumeration';
import { EXT_NAME } from '../lib/constant';

import Node from '../base/node';
import NodeList from '../base/nodelist';
import Application from '../base/application';
import Extension from '../base/extension';

import { hasValue, sortAsc, withinFraction } from '../lib/util';
import { isStyleElement, newBoxRect } from '../lib/dom';

export default abstract class Grid<T extends Node> extends Extension<T> {
    public condition(node: T) {
        return this.included(<HTMLElement> node.element) || (node.length > 1 && (
            (node.display === 'table' && node.every(item => item.display === 'table-row' && item.every(child => child.display === 'table-cell'))) ||
            (node.every(item => item.pageflow && !item.has('backgroundColor') && !item.has('backgroundImage') && (item.borderTopWidth + item.borderRightWidth + item.borderBottomWidth + item.borderLeftWidth === 0) && (!item.inlineElement || item.blockStatic)) && (
                node.css('listStyle') === 'none' ||
                node.every(item => item.display === 'list-item' && item.css('listStyleType') === 'none') ||
                (!hasValue(node.dataset.ext) && !node.flex.enabled && node.length > 1 && node.some(item => item.length > 1) && !node.some(item => item.display === 'list-item' || item.textElement))
            ))
        ));
    }

    public processNode(node: T, parent: T, mapX: LayoutMapX<T>): ExtensionResult<T> {
        const columnBalance = !!this.options.columnBalance;
        const mainData: GridData = {
            padding: newBoxRect(),
            columnEnd: [],
            columnCount: 0
        };
        let output = '';
        let columns: T[][] = [];
        if (columnBalance) {
            const dimensions: number[][] = [];
            node.each((item, index) => {
                dimensions[index] = [];
                item.each(subitem => dimensions[index].push(subitem.bounds.width));
                columns.push(item.duplicate() as T[]);
            });
            const base = columns[
                dimensions.findIndex(item => {
                    const column = dimensions.reduce((a, b) => {
                        if (a.length === b.length) {
                            const sumA = a.reduce((c, d) => c + d, 0);
                            const sumB = b.reduce((c, d) => c + d, 0);
                            return sumA < sumB ? a : b;
                        }
                        else {
                            return a.length < b.length ? a : b;
                        }
                    });
                    return item === column;
                })
            ];
            if (base && base.length > 1) {
                let maxIndex = -1;
                let assigned: number[] = [];
                let every = false;
                for (let l = 0; l < base.length; l++) {
                    const bounds = base[l].bounds;
                    const found: number[] = [];
                    if (l < base.length - 1) {
                        for (let m = 0; m < columns.length; m++) {
                            if (columns[m] === base) {
                                found.push(l);
                            }
                            else {
                                const result = columns[m].findIndex((item, index) => index >= l && Math.floor(item.bounds.width) === Math.floor(bounds.width) && index < columns[m].length - 1);
                                if (result !== -1) {
                                    found.push(result);
                                }
                                else {
                                    found.length = 0;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        for (let m = 0; m < columns.length; m++) {
                            if (columns[m].length > base.length) {
                                const removed = columns[m].splice(assigned[m] + (every ? 2 : 1), columns[m].length - base.length);
                                columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'siblings', [...removed]);
                            }
                        }
                    }
                    if (found.length === columns.length) {
                        const minIndex = found.reduce((a, b) => Math.min(a, b));
                        maxIndex = found.reduce((a, b) => Math.max(a, b));
                        if (maxIndex > minIndex) {
                            for (let m = 0; m < columns.length; m++) {
                                if (found[m] > minIndex) {
                                    const removed = columns[m].splice(minIndex, found[m] - minIndex);
                                    columns[m][assigned[m] + (every ? 1 : 0)].data(EXT_NAME.GRID, 'siblings', [...removed]);
                                }
                            }
                        }
                        assigned = found;
                        every = true;
                    }
                    else {
                        assigned = new Array(columns.length).fill(l);
                        every = false;
                    }
                }
            }
            else {
                columns.length = 0;
            }
        }
        else {
            function getRowIndex(current: T) {
                return columns[0].findIndex(item => withinFraction(item.linear.top, current.linear.top) || (current.linear.top >= item.linear.top && current.linear.bottom <= item.linear.bottom));
            }
            const nextMapX: ObjectIndex<T[]> = mapX[node.depth + 2];
            const nextCoordsX = nextMapX ? Object.keys(nextMapX) : [];
            const columnEnd: number[] = [];
            if (nextCoordsX.length > 1) {
                const columnRight: number[] = [];
                for (let l = 0; l < nextCoordsX.length; l++) {
                    const nextAxisX = sortAsc(nextMapX[parseInt(nextCoordsX[l])].filter(item => item.documentParent.documentParent.id === node.id), 'linear.top');
                    if (l === 0 && nextAxisX.length === 0) {
                        return { output: '' };
                    }
                    columnRight[l] = l === 0 ? 0 : columnRight[l - 1];
                    for (let m = 0; m < nextAxisX.length; m++) {
                        const nextX = nextAxisX[m];
                        let [left, right] = [nextX.linear.left, nextX.linear.right];
                        let index = l;
                        if (index > 0 && isStyleElement(nextX.element) && nextX.float === 'right') {
                            nextX.element.style.cssFloat = 'left';
                            const bounds = nextX.element.getBoundingClientRect();
                            if (bounds.left - nextX.marginLeft !== left) {
                                [left, right] = [bounds.left - nextX.marginLeft, bounds.right + nextX.marginRight];
                                for (let n = 1; n < columnRight.length; n++) {
                                    index = n;
                                    if (left > columnRight[n - 1]) {
                                        break;
                                    }
                                }
                            }
                            nextX.element.style.cssFloat = 'right';
                        }
                        if (index === 0 || left >= columnRight[index - 1]) {
                            if (columns[index] === undefined) {
                                columns[index] = [];
                            }
                            if (index === 0 || columns[0].length === nextAxisX.length) {
                                columns[index][m] = nextX;
                            }
                            else {
                                const row = getRowIndex(nextX);
                                if (row !== -1) {
                                    columns[index][row] = nextX;
                                }
                            }
                        }
                        else {
                            const current = columns.length - 1;
                            if (columns[current]) {
                                const minLeft = columns[current].reduce((a: number, b) => Math.min(a, b.linear.left), Number.MAX_VALUE);
                                const maxRight = columns[current].reduce((a: number, b) => Math.max(a, b.linear.right), 0);
                                if (left > minLeft && right > maxRight) {
                                    const filtered = columns.filter(item => item);
                                    const rowIndex = getRowIndex(nextX);
                                    if (rowIndex !== -1 && filtered[filtered.length - 1][rowIndex] === undefined) {
                                        columns[current].length = 0;
                                    }
                                }
                            }
                        }
                        columnRight[l] = Math.max(nextX.linear.right, columnRight[l]);
                    }
                }
                for (let l = 0, m = -1; l < columnRight.length; l++) {
                    if (m === -1 && columns[l] === undefined) {
                        m = l - 1;
                    }
                    else if (columns[l] === undefined) {
                        if (m !== -1 && l === columnRight.length - 1) {
                            columnRight[m] = columnRight[l];
                        }
                    }
                    else if (m !== -1) {
                        columnRight[m] = columnRight[l - 1];
                        m = -1;
                    }
                }
                for (let l = 0; l < columns.length; l++) {
                    if (columns[l] && columns[l].length > 0) {
                        columnEnd.push(columnRight[l]);
                    }
                }
                columns = columns.filter(item => item && item.length > 0);
                const columnLength = columns.reduce((a, b) => Math.max(a, b.length), 0);
                for (let l = 0; l < columnLength; l++) {
                    for (let m = 0; m < columns.length; m++) {
                        if (columns[m][l] === undefined) {
                            columns[m][l] = { spacer: 1 } as any;
                        }
                    }
                }
            }
            if (columnEnd.length > 0) {
                mainData.columnEnd = columnEnd;
                mainData.columnEnd[mainData.columnEnd.length - 1] = node.box.right;
            }
        }
        if (columns.length > 1 && columns[0].length === node.length) {
            mainData.columnCount = columnBalance ? columns[0].length : columns.length;
            output = this.application.writeGridLayout(node, parent, mainData.columnCount);
            node.duplicate().forEach(item => node.remove(item) && item.hide());
            for (let l = 0, count = 0; l < columns.length; l++) {
                let spacer = 0;
                for (let m = 0, start = 0; m < columns[l].length; m++) {
                    const item = columns[l][m];
                    if (!(<any> item).spacer) {
                        item.parent = node;
                        const data: GridCellData = {
                            inherit: true,
                            rowSpan: 0,
                            columnSpan: 0,
                            index: -1,
                            cellFirst: false,
                            cellLast: false,
                            rowEnd: false,
                            rowStart: false
                        };
                        if (columnBalance) {
                            data.rowStart = m === 0;
                            data.rowEnd = m === columns[l].length - 1;
                            data.cellFirst = l === 0 && m === 0;
                            data.cellLast = l === columns.length - 1 && data.rowEnd;
                            data.index = m;
                        }
                        else {
                            let rowSpan = 1;
                            let columnSpan = 1 + spacer;
                            for (let n = l + 1; n < columns.length; n++) {
                                if ((<any> columns[n][m]).spacer === 1) {
                                    columnSpan++;
                                    (<any> columns[n][m]).spacer = 2;
                                }
                                else {
                                    break;
                                }
                            }
                            if (columnSpan === 1) {
                                for (let n = m + 1; n < columns[l].length; n++) {
                                    if ((<any> columns[l][n]).spacer === 1) {
                                        rowSpan++;
                                        (<any> columns[l][n]).spacer = 2;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            data.rowSpan = rowSpan;
                            data.columnSpan = columnSpan;
                            data.rowStart = start++ === 0;
                            data.rowEnd = columnSpan + l === columns.length;
                            data.cellFirst = count++ === 0;
                            data.cellLast = data.rowEnd && m === columns[l].length - 1;
                            data.index = l;
                            spacer = 0;
                        }
                        item.data(EXT_NAME.GRID, 'cellData', data);
                    }
                    else if ((<any> item).spacer === 1) {
                        spacer++;
                    }
                }
            }
            sortAsc(node.list, 'documentParent.siblingIndex', 'siblingIndex');
            if (node.display === 'table') {
                if (node.css('borderCollapse') === 'collapse') {
                    node.modifyBox(BOX_STANDARD.PADDING_TOP, null);
                    node.modifyBox(BOX_STANDARD.PADDING_RIGHT, null);
                    node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, null);
                    node.modifyBox(BOX_STANDARD.PADDING_LEFT, null);
                }
            }
            node.data(EXT_NAME.GRID, 'mainData', mainData);
            node.render(parent);
        }
        return { output };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
        const mainData: GridData = parent.data(EXT_NAME.GRID, 'mainData');
        const cellData: GridCellData = node.data(EXT_NAME.GRID, 'cellData');
        if (mainData && cellData) {
            let siblings: T[];
            if (this.options.columnBalance) {
                siblings = node.data(EXT_NAME.GRID, 'siblings');
            }
            else {
                const columnEnd = mainData.columnEnd[Math.min(cellData.index + (cellData.columnSpan - 1), mainData.columnEnd.length - 1)];
                siblings = Array.from(node.documentParent.element.children).map(element => {
                    const item = Node.getNodeFromElement(element);
                    return (
                        item &&
                        item.visible &&
                        !item.excluded &&
                        !item.rendered &&
                        item.linear.left >= node.linear.right &&
                        item.linear.right <= columnEnd ? item : null
                    );
                })
                .filter(item => item) as T[];
            }
            if (siblings && siblings.length > 0) {
                let output = '';
                siblings.unshift(node);
                const group = this.application.viewController.createGroup(parent, node, siblings);
                const linearX = NodeList.linearX(siblings);
                if (linearX && Application.isRelativeHorizontal(siblings)) {
                    output = this.application.writeRelativeLayout(group, parent);
                    group.alignmentType |= NODE_ALIGNMENT.HORIZONTAL;
                }
                else {
                    if (linearX || NodeList.linearY(siblings)) {
                        output = this.application.writeLinearLayout(group, parent, linearX);
                    }
                    else {
                        output = this.application.writeConstraintLayout(group, parent);
                    }
                    group.alignmentType |= NODE_ALIGNMENT.SEGMENTED;
                }
                node.alignmentType |= NODE_ALIGNMENT.EXCLUDE;
                return { output, parent: group, complete: true };
            }
        }
        return { output: '' };
    }
}
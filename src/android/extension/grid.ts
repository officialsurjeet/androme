import { ExtensionResult } from '../../extension/lib/types';
import { GridCellData, GridData } from '../../extension/lib/types';
import Grid from '../../extension/grid';
import View from '../view';
import { formatPX } from '../../lib/util';
import { getBoxSpacing } from '../../lib/dom';
import { BOX_STANDARD, NODE_STANDARD } from '../../lib/constants';
import { EXT_NAME } from '../../extension/lib/constants';

export default class GridAndroid<T extends View> extends Grid<T> {
    constructor(name: string, tagNames?: string[], options?: {}) {
        super(name, tagNames, options);
    }

    public processChild(): ExtensionResult {
        const node = this.node;
        const data = <GridCellData> node.data(EXT_NAME.GRID, 'cellData');
        if (data) {
            if (data.rowSpan > 1) {
                node.app('layout_rowSpan', data.rowSpan.toString());
            }
            if (data.columnSpan > 1) {
                node.app('layout_columnSpan', data.columnSpan.toString());
            }
            if (node.parent.display === 'table' && node.display === 'table-cell') {
                node.app('layout_gravity', 'fill');
            }
        }
        return super.processChild();
    }

    public afterRender() {
        const extended: T[] = [];
        this.application.cache.each((node: T) => {
            if (node.renderExtension.includes(this)) {
                extended.push(node);
            }
            else {
                const parent = node.renderParent;
                if (parent.is(NODE_STANDARD.GRID) && !(parent.display === 'table' && parent.css('borderCollapse') === 'collapse')) {
                    const mainData = <GridData> parent.data(EXT_NAME.GRID, 'mainData');
                    const cellData = <GridCellData> node.data(EXT_NAME.GRID, 'cellData');
                    if (mainData && cellData) {
                        const dimensions = getBoxSpacing(node.documentParent.element, true);
                        const padding = mainData.padding;
                        if (cellData.cellFirst) {
                            padding.top = dimensions.paddingTop + dimensions.marginTop;
                        }
                        if (cellData.rowStart) {
                            padding.left = Math.max(dimensions.marginLeft + dimensions.paddingLeft, padding.left);
                        }
                        if (cellData.rowEnd) {
                            const heightBottom = dimensions.marginBottom + dimensions.paddingBottom + (!cellData.cellLast ? dimensions.marginTop + dimensions.paddingTop : 0);
                            if (heightBottom > 0) {
                                if (cellData.cellLast) {
                                    padding.bottom = heightBottom;
                                }
                                else {
                                    this.application.controllerHandler.appendAfter(
                                        node.id,
                                        this.application.controllerHandler.renderNodeStatic(
                                            NODE_STANDARD.SPACE,
                                            node.renderDepth,
                                            {
                                                app: {
                                                    layout_columnSpan: mainData.columnCount.toString()
                                                }
                                            },
                                            'match_parent',
                                            formatPX(heightBottom)
                                        )
                                    );
                                }
                            }
                            padding.right = Math.max(dimensions.marginRight + dimensions.paddingRight, padding.right);
                        }
                    }
                }
            }
        });
        for (const node of extended) {
            const data = <GridData> node.data(EXT_NAME.GRID, 'mainData');
            if (data) {
                node.modifyBox(BOX_STANDARD.PADDING_TOP, data.padding.top);
                node.modifyBox(BOX_STANDARD.PADDING_RIGHT, data.padding.right);
                node.modifyBox(BOX_STANDARD.PADDING_BOTTOM, data.padding.bottom);
                node.modifyBox(BOX_STANDARD.PADDING_LEFT, data.padding.left);
            }
        }
    }
}
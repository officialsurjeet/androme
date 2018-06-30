import { ExtensionResult } from '../lib/types';
import Extension from '../base/extension';
import Node from '../base/node';
import NodeList from '../base/nodelist';

type T = Node;
type U = NodeList<T>;

export default class Table extends Extension<T, U> {
    constructor(name: string, tagNames: string[], options?: {}) {
        super(name, tagNames, options);
    }

    public processNode(): ExtensionResult {
        const tableRows: T[] = [];
        const thead = this.node.children.find(node => node.tagName === 'THEAD');
        const tbody = this.node.children.find(node => node.tagName === 'TBODY');
        const tfoot = this.node.children.find(node => node.tagName === 'TFOOT');
        if (thead != null) {
            thead.cascade().filter(node => node.tagName === 'TH' || node.tagName === 'TD').forEach(node => node.inheritStyleMap(thead));
            tableRows.push(...(<T[]> thead.children));
            thead.hide();
        }
        if (tbody != null) {
            tableRows.push(...(<T[]> tbody.children));
            tbody.hide();
        }
        if (tfoot != null) {
            tfoot.cascade().filter(node => node.tagName === 'TH' || node.tagName === 'TD').forEach(node => node.inheritStyleMap(tfoot));
            tableRows.push(...(<T[]> tfoot.children));
            tfoot.hide();
        }
        const rowCount = tableRows.length;
        let columnCount = 0;
        for (let i = 0; i < tableRows.length; i++) {
            const tr = tableRows[i];
            tr.hide();
            columnCount = Math.max(tr.children.map(node => node.element).reduce((a, b: HTMLTableDataCellElement) => a + b.colSpan, 0), columnCount);
            for (let j = 0; j < tr.children.length; j++) {
                const td = tr.children[j];
                const style = td.element.style;
                const element = (<HTMLTableCellElement> td.element);
                if (element.rowSpan > 1) {
                    td.gridRowSpan = element.rowSpan;
                }
                if (element.colSpan > 1) {
                    td.gridColumnSpan = element.colSpan;
                }
                if (td.styleMap.textAlign == null && !(style.textAlign === 'left' || style.textAlign === 'start')) {
                    td.styleMap.textAlign = (<string> style.textAlign);
                }
                if (td.styleMap.verticalAlign == null && style.verticalAlign === '') {
                    td.styleMap.verticalAlign = 'middle';
                }
                const [width, height] = (this.node.style.borderCollapse === 'collapse' ? ['0px', '0px'] : (<string> this.node.style.borderSpacing).split(' '));
                delete td.styleMap.margin;
                td.styleMap.marginTop = height;
                td.styleMap.marginRight = width;
                td.styleMap.marginBottom = height;
                td.styleMap.marginLeft = width;
                td.parent = this.node;
            }
        }
        const xml = this.application.writeGridLayout(this.node, (<T> this.parent), columnCount, rowCount);
        return [xml, false, false];
    }
}
import { WIDGET_ANDROID, MAPPING_CHROME, STRING_ANDROID, XMLNS_ANDROID, BUILD_ANDROID, DENSITY_ANDROID } from './lib/constants';
import * as Util from './lib/util';
import * as Color from './lib/color';
import * as Element from './lib/element';
import Node from './node';
import NodeList from './nodelist';
import { positionViews } from './constraint';
import { RESOURCE, insertResourceAsset, getViewAttributes, parseStyleAttribute, writeResourceDrawableXml, writeResourceColorXml, writeResourceStyleXml, writeResourceArrayXml, writeResourceStringXml } from './resource';
import RTL from './localization';
import SETTINGS from './settings';

const BLOCK_CHROME =
[
    'DIV',
    'LI',
    'TD',
    'SECTION',
    'SPAN'
];

const INLINE_CHROME =
[
    'STRONG',
    'B',
    'EM',
    'CITE',
    'DFN',
    'I',
    'BIG',
    'SMALL',
    'FONT',
    'BLOCKQUOTE',
    'TT',
    'A',
    'U',
    'SUP',
    'SUB',
    'STRIKE',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'DEL',
    'TEXT'
];

const NODE_CACHE = new NodeList();

function writeFrameLayout(node, parent) {
    return renderViewLayout(node, parent, WIDGET_ANDROID.FRAME);
}

function writeLinearLayout(node, parent, vertical) {
    node.android('orientation', (vertical ? 'vertical' : 'horizontal'));
    return renderViewLayout(node, parent, WIDGET_ANDROID.LINEAR);
}

function writeRelativeLayout(node, parent) {
    return renderViewLayout(node, parent, WIDGET_ANDROID.RELATIVE);
}

function writeConstraintLayout(node, parent) {
    return renderViewLayout(node, parent, WIDGET_ANDROID.CONSTRAINT);
}

function writeGridLayout(node, parent, columnCount = 2) {
    node.android('columnCount', columnCount);
    return renderViewLayout(node, parent, WIDGET_ANDROID.GRID);
}

function writeDefaultLayout(node, parent) {
    if (SETTINGS.useConstraintLayout || node.flex.enabled) {
        return writeConstraintLayout(node, parent);
    }
    else {
        return writeRelativeLayout(node, parent);
    }
}

function renderViewLayout(node, parent, tagName) {
    let preXml = '';
    let postXml = '';
    let renderParent = parent;
    node.setAndroidId(tagName);
    if (node.overflow != 0) {
        const scrollView = [];
        if (node.overflowX) {
            scrollView.push(WIDGET_ANDROID.SCROLL_HORIZONTAL);
        }
        if (node.overflowY) {
            scrollView.push((node.ascend().some(item => item.overflow != 0) ? WIDGET_ANDROID.SCROLL_NESTED : WIDGET_ANDROID.SCROLL_VERTICAL));
        }
        let current = node;
        let scrollDepth = parent.renderDepth + scrollView.length;
        scrollView
            .map(widgetName => {
                const wrapNode = Node.createWrapNode(generateNodeId(), current, SETTINGS.targetAPI, null, new NodeList([current]));
                NODE_CACHE.push(wrapNode);
                wrapNode.setAndroidId(widgetName);
                wrapNode.setBounds();
                wrapNode.android('fadeScrollbars', 'false');
                wrapNode.setAttributes();
                switch (widgetName) {
                    case WIDGET_ANDROID.SCROLL_HORIZONTAL:
                        wrapNode
                            .css('width', node.styleMap.width)
                            .css('minWidth', node.styleMap.minWidth)
                            .css('overflowX', node.styleMap.overflowX);
                        break;
                    default:
                        wrapNode
                            .css('height', node.styleMap.height)
                            .css('minHeight', node.styleMap.minHeight)
                            .css('overflowY', node.styleMap.overflowY);
                        break;
                }
                const indent = Util.padLeft(scrollDepth--);
                preXml = indent + `<${widgetName}{@${wrapNode.id}}>\n` + preXml;
                postXml += indent + `</${widgetName}>\n`;
                if (current == node) {
                    node.parent = wrapNode;
                    renderParent = wrapNode;
                }
                current = wrapNode;
                return wrapNode;
            })
            .reverse()
            .forEach((item, index) => {
                switch (index) {
                    case 0:
                        item.parent = parent;
                        item.render(parent);
                        break;
                    case 1:
                        item.parent = current;
                        item.render(current);
                        break;
                }
                current = item;
            });
    }
    node.setAttributes();
    node.applyCustomizations();
    node.render(renderParent);
    node.setGravity();
    return getEnclosingTag(node.renderDepth, tagName, node.id, `{${node.id}}`, insertGridSpace(node), preXml, postXml);
}

function renderViewTag(node, parent, tagName) {
    const element = node.element;
    node.setAndroidId(tagName);
    switch (node.widgetName) {
        case WIDGET_ANDROID.EDIT:
            node.android('inputType', 'text');
            break;
        case WIDGET_ANDROID.BUTTON:
            if (node.viewWidth == 0) {
                node.android('minWidth', '0px');
            }
            if (node.viewHeight == 0) {
                node.android('minHeight', '0px');
            }
            break;
    }
    if (node.overflow != 0) {
        let scrollbars = [];
        if (node.overflowX) {
            scrollbars.push('horizontal');
        }
        if (node.overflowY) {
            scrollbars.push('vertical');
        }
        node.android('scrollbars', scrollbars.join('|'));
    }
    switch (element.tagName) {
        case 'IMG':
            const image = element.src.substring(element.src.lastIndexOf('/') + 1);
            const format = image.substring(image.lastIndexOf('.') + 1).toLowerCase();
            let src = image.replace(/.\w+$/, '');
            switch (format) {
                case 'bmp':
                case 'gif':
                case 'jpg':
                case 'png':
                case 'webp':
                    src = insertResourceAsset(RESOURCE['image'], src, element.src);
                    break;
                default:
                    src = `(UNSUPPORTED: ${image})`;
            }
            node.androidSrc = src;
            break;
        case 'TEXTAREA':
            node.android('minLines', 2);
            if (element.rows > 2) {
                node.android('maxLines', element.rows);
            }
            if (element.maxlength != null) {
                node.android('maxLength', parseInt(element.maxlength));
            }
            node.android('hint', element.placeholder)
                .android('scrollbars', 'vertical')
                .android('inputType', 'textMultiLine');
            if (node.styleMap.overflowX == 'scroll') {
                node.android('scrollHorizontally', 'true');
            }
            break;
    }
    switch (element.type) {
        case 'password':
            node.android('inputType', 'textPassword');
            break;
    }
    node.setAttributes();
    node.applyCustomizations();
    if (node.visible) {
        node.render(parent);
        node.setGravity();
        node.cascade().forEach(item => item.hide());
        return getEnclosingTag(node.renderDepth, node.widgetName, node.id, '', insertGridSpace(node));
    }
}

function getEnclosingTag(depth, tagName, id, content, space = ['', ''], preXml = '', postXml = '') {
    const indent = Util.padLeft(depth);
    let xml = space[0] +
              preXml;
    if (Util.hasValue(content)) {
        xml += indent + `<${tagName}{@${id}}>\n` +
                        content +
               indent + `</${tagName}>\n`;
    }
    else {
        xml += indent + `<${tagName}{@${id}} />\n`;
    }
    xml += postXml +
           space[1];
    return xml;
}

function insetAttributes(output) {
    const namespaces = {};
    for (const node of NODE_CACHE) {
        node.setAndroidDimensions();
        node.namespaces.forEach(value => namespaces[value] = true);
        output = output.replace(`{@${node.id}}`, getViewAttributes(node));
    }
    return output.replace('{@0}', Object.keys(namespaces).sort().map(value => `\n\t${XMLNS_ANDROID[value.toUpperCase()]}`).join(''));
}

function setConstraints() {
    for (const node of NODE_CACHE) {
        positionViews(node);
    }
}

function insertGridSpace(node) {
    let preXml = '';
    let postXml = '';
    if (node.parent.isView(WIDGET_ANDROID.GRID)) {
        const dimensions = Element.getBoxSpacing(node.parentOriginal.element, SETTINGS.useRTL, true);
        if (node.gridFirst) {
            const heightTop = dimensions.paddingTop + dimensions.marginTop;
            if (heightTop > 0) {
                preXml += getSpaceTag(node.renderDepth, 'match_parent', Util.convertToPX(heightTop), node.renderParent.gridColumnCount, 1);
            }
        }
        if (node.gridRowStart) {
            let marginLeft = dimensions[RTL('marginLeft')] + dimensions[RTL('paddingLeft')];
            if (marginLeft > 0) {
                marginLeft = Util.convertToPX(marginLeft + node.marginLeft);
                node.android(RTL('layout_marginLeft'), marginLeft)
                    .css('marginLeft', marginLeft);
            }
        }
        if (node.gridRowEnd) {
            const heightBottom = dimensions.marginBottom + dimensions.paddingBottom + (!node.gridLast ? dimensions.marginTop + dimensions.paddingTop : 0);
            let marginRight = dimensions[RTL('marginRight')] + dimensions[RTL('paddingRight')];
            if (heightBottom > 0) {
                postXml += getSpaceTag(node.renderDepth, 'match_parent', Util.convertToPX(heightBottom), node.renderParent.gridColumnCount, 1);
            }
            if (marginRight > 0) {
                marginRight = Util.convertToPX(marginRight + node.marginRight);
                node.android(RTL('layout_marginRight'), marginRight)
                    .css('marginRight', marginRight);
            }
        }
    }
    return [preXml, postXml];
}

function getSpaceTag(depth, width, height, columnSpan, columnWeight = 0) {
    let attributes = '';
    if (SETTINGS.showAttributes) {
        const node = new Node(0, null, SETTINGS.targetAPI);
        node.android('layout_width', width)
            .android('layout_height', height)
            .android('layout_columnSpan', columnSpan)
            .android('layout_columnWeight', columnWeight);
        const indent = Util.padLeft(depth + 1);
        for (const attr of node.combine()) {
            attributes += `\n${indent + attr}`;
        }
    }
    return getEnclosingTag(depth, WIDGET_ANDROID.SPACE, 0, '').replace('{@0}', attributes);
}

function deleteStyleAttribute(sorted, attributes, nodeIds) {
    attributes.split(';').forEach(value => {
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i] != null) {
                let index = -1;
                let key = '';
                for (const j in sorted[i]) {
                    if (j == value) {
                        index = i;
                        key = j;
                        i = sorted.length;
                        break;
                    }
                }
                if (index != -1) {
                    sorted[index][key] = sorted[index][key].filter(value => !nodeIds.includes(value));
                    if (sorted[index][key].length == 0) {
                        delete sorted[index][key];
                    }
                    break;
                }
            }
        }
    });
}

function setStyleMap() {
    for (const styleSheet of document.styleSheets) {
        for (const rule of styleSheet.rules) {
            const elements = document.querySelectorAll(rule.selectorText);
            const attributes = new Set();
            for (const i of rule.styleMap) {
                attributes.add(Util.hyphenToCamelCase(i[0]));
            }
            for (const element of elements) {
                for (const i of element.style) {
                    attributes.add(Util.hyphenToCamelCase(i));
                }
                const style = Element.getStyle(element);
                const styleMap = {};
                for (const name of attributes) {
                    if (name.toLowerCase().indexOf('color') != -1) {
                        const color = Color.getByColorName(rule.style[name]);
                        if (color != null) {
                            rule.style[name] = Color.convertToRGB(color);
                        }
                    }
                    if (Util.hasValue(element.style[name])) {
                        styleMap[name] = element.style[name];
                    }
                    else if (style[name] == rule.style[name]) {
                        styleMap[name] = style[name];
                    }
                }
                element.styleMap = styleMap;
            }
        }
    }
}

function setResourceStyle() {
    const cache = {};
    const style = {};
    const layout = {};
    for (const node of NODE_CACHE) {
        if (node.styleAttributes.length > 0) {
            if (cache[node.tagName] == null) {
                cache[node.tagName] = [];
            }
            cache[node.tagName].push(node);
        }
    }
    for (const tag in cache) {
        const nodes = cache[tag];
        let sorted = Array.from({ length: nodes.reduce((a, b) => Math.max(a, b.styleAttributes.length), 0) }, value => {
            value = {};
            return value;
        });
        for (const node of nodes) {
            for (let i = 0; i < node.styleAttributes.length; i++) {
                const attr = parseStyleAttribute(node.styleAttributes[i]);
                if (sorted[i][attr] == null) {
                    sorted[i][attr] = [];
                }
                sorted[i][attr].push(node.id);
            }
        }
        style[tag] = {};
        layout[tag] = {};
        do {
            if (sorted.length == 1) {
                for (const attr in sorted[0]) {
                    const value = sorted[0][attr];
                    if (value.length > 2) {
                        style[tag][attr] = value;
                    }
                    else {
                        layout[tag][attr] = value;
                    }
                }
                sorted.length = 0;
            }
            else {
                const styleKey = {};
                const layoutKey = {};
                for (let i = 0; i < sorted.length; i++) {
                    const filtered = {};
                    for (const attr1 in sorted[i]) {
                        if (sorted[i] == null) {
                            continue;
                        }
                        const ids = sorted[i][attr1];
                        let revalidate = false;
                        if (ids == null) {
                            continue;
                        }
                        else if (ids.length == nodes.length) {
                            styleKey[attr1] = ids;
                            sorted[i] = null;
                            revalidate = true;
                        }
                        else if (ids.length == 1) {
                            layoutKey[attr1] = ids;
                            sorted[i] = null;
                            revalidate = true;
                        }
                        if (!revalidate) {
                            const found = {};
                            for (let j = 0; j < sorted.length; j++) {
                                if (i != j) {
                                    for (const attr in sorted[j]) {
                                        const compare = sorted[j][attr];
                                        for (let k = 0; k < ids.length; k++) {
                                            if (compare.includes(ids[k])) {
                                                if (found[attr] == null) {
                                                    found[attr] = [];
                                                }
                                                found[attr].push(ids[k]);
                                            }
                                        }
                                    }
                                }
                            }
                            for (const attr2 in found) {
                                if (found[attr2].length > 1) {
                                    filtered[[attr1, attr2].sort().join(';')] = found[attr2];
                                }
                            }
                        }
                    }
                    const combined = {};
                    const deleteKeys = new Set();
                    for (const attr1 in filtered) {
                        for (const attr2 in filtered) {
                            if (attr1 != attr2 && filtered[attr1].join('') == filtered[attr2].join('')) {
                                const shared = filtered[attr1].join(',');
                                if (combined[shared] != null) {
                                    combined[shared] = new Set([...combined[shared], ...attr2.split(';')]);
                                }
                                else {
                                    combined[shared] = new Set([...attr1.split(';'), ...attr2.split(';')]);
                                }
                                deleteKeys.add(attr1).add(attr2);
                            }
                        }
                    }
                    deleteKeys.forEach(value => delete filtered[value]);
                    for (const attributes in filtered) {
                        deleteStyleAttribute(sorted, attributes, filtered[attributes]);
                        style[tag][attributes] = filtered[attributes];
                    }
                    for (const ids in combined) {
                        const attributes = Array.from(combined[ids]).sort().join(';');
                        const nodeIds = ids.split(',').map(id => parseInt(id));
                        deleteStyleAttribute(sorted, attributes, nodeIds);
                        style[tag][attributes] = nodeIds;
                    }
                }
                const combined = Object.keys(styleKey);
                if (combined.length > 0) {
                    style[tag][combined.join(';')] = styleKey[combined[0]];
                }
                for (const attribute in layoutKey) {
                    layout[tag][attribute] = layoutKey[attribute];
                }
                for (let i = 0; i < sorted.length; i++) {
                    if (sorted[i] != null && Object.keys(sorted[i]).length == 0) {
                        delete sorted[i];
                    }
                }
                sorted = sorted.filter(item => item);
            }
        }
        while (sorted.length > 0);
    }
    const resource = new Map();
    for (const name in style) {
        const tag = style[name];
        const tagData = [];
        for (const attributes in tag) {
            tagData.push({ attributes, ids: tag[attributes]});
        }
        tagData.sort((a, b) => {
            let [c, d] = [a.ids.length, b.ids.length];
            if (c == d) {
                [c, d] = [a.attributes.split(';').length, b.attributes.split(';').length];
            }
            return (c >= d ? -1 : 1);
        });
        tagData.forEach((item, index) => item.name = `${name.charAt(0) + name.substring(1).toLowerCase()}_${(index + 1)}`);
        resource.set(name, tagData);
    }
    const inherit = new Set();
    for (const node of NODE_CACHE) {
        if (node.visible) {
            const tagName = node.tagName;
            if (resource.has(tagName)) {
                const styles = [];
                for (const tag of resource.get(tagName)) {
                    if (tag.ids.includes(node.id)) {
                        styles.push(tag.name);
                    }
                }
                if (styles.length > 0) {
                    inherit.add(styles.join('.'));
                    node.androidStyle = styles.pop();
                    if (node.androidStyle != '') {
                        node.attr(`style="@style/${node.androidStyle}"`);
                    }
                }
            }
            const tag = layout[tagName];
            if (tag != null) {
                for (const attr in tag) {
                    if (tag[attr].includes(node.id)) {
                        node.attr((SETTINGS.useUnitDP ? Util.insetToDP(attr, SETTINGS.density, true) : attr));
                    }
                }
            }
        }
    }
    inherit.forEach(styles => {
        let parent = null;
        styles.split('.').forEach(value => {
            const match = value.match(/^(\w+)_([0-9]+)$/);
            if (match != null) {
                const style = resource.get(match[1].toUpperCase())[parseInt(match[2] - 1)];
                RESOURCE['style'].set(value, { parent, attributes: style.attributes });
                parent = value;
            }
        });
    });
}

function setAccessibility() {
    for (const node of NODE_CACHE) {
        if (node.visible) {
            switch (node.widgetName) {
                case WIDGET_ANDROID.EDIT:
                    let parent = node.renderParent;
                    let current = node;
                    let label = null;
                    while (parent != null && typeof parent == 'object') {
                        const index = parent.renderChildren.findIndex(item => item == current);
                        if (index > 0) {
                            label = parent.renderChildren[index - 1];
                            break;
                        }
                        current = parent;
                        parent = parent.renderParent;
                    }
                    if (label != null && label.isView(WIDGET_ANDROID.TEXT)) {
                        label.android('labelFor', node.stringId);
                    }
                case WIDGET_ANDROID.SPINNER:
                case WIDGET_ANDROID.CHECKBOX:
                case WIDGET_ANDROID.RADIO:
                case WIDGET_ANDROID.BUTTON:
                    node.android('focusable', 'true');
                    break;
            }
        }
    }
}

function setMarginPadding() {
    for (const node of NODE_CACHE) {
        if (node.isView(WIDGET_ANDROID.LINEAR, WIDGET_ANDROID.RADIO_GROUP)) {
            if (node.android('orientation') == 'vertical') {
                let current = node.box.top + node.paddingTop;
                node.renderChildren.sortAsc('linear.top').forEach(item => {
                    const height = Math.ceil(item.linear.top - current);
                    if (height > 0) {
                        item.android('layout_marginTop', Util.formatPX(node.marginTop + height));
                    }
                    current = item.linear.bottom;
                });
            }
            else {
                let current = node.box.left + node.paddingLeft;
                node.renderChildren.sortAsc('linear.left').forEach(item => {
                    if (!item.floating) {
                        const width = Math.ceil(item.linear.left - current);
                        if (width > 0) {
                            item.android(RTL('layout_marginLeft'), Util.formatPX(node.marginLeft + width));
                        }
                    }
                    current = (item.label || item).linear.right;
                });
            }
        }
        if (SETTINGS.targetAPI >= BUILD_ANDROID.OREO) {
            if (node.visible) {
                const marginLeft_RTL = RTL('layout_marginLeft');
                const marginRight_RTL = RTL('layout_marginRight');
                const paddingLeft_RTL = RTL('paddingLeft');
                const paddingRight_RTL = RTL('paddingRight');
                const marginTop = Util.convertToInt(node.android('layout_marginTop'));
                const marginRight = Util.convertToInt(node.android(marginRight_RTL));
                const marginBottom = Util.convertToInt(node.android('layout_marginBottom'));
                const marginLeft = Util.convertToInt(node.android(marginLeft_RTL));
                if (marginTop != 0 && marginTop == marginBottom && marginBottom == marginLeft && marginLeft == marginRight) {
                    node.delete('android', 'layout_margin*')
                        .android('layout_margin', Util.formatPX(marginTop));
                }
                else {
                    if (marginTop != 0 && marginTop == marginBottom) {
                        node.delete('android', 'layout_marginTop', 'layout_marginBottom')
                            .android('layout_marginVertical', Util.formatPX(marginTop));
                    }
                    if (marginLeft != 0 && marginLeft == marginRight) {
                        node.delete('android', marginLeft_RTL, marginRight_RTL)
                            .android('layout_marginHorizontal', Util.formatPX(marginLeft));
                    }
                }
                const paddingTop = Util.convertToInt(node.android('paddingTop'));
                const paddingRight = Util.convertToInt(node.android(paddingRight_RTL));
                const paddingBottom = Util.convertToInt(node.android('paddingBottom'));
                const paddingLeft = Util.convertToInt(node.android(paddingLeft_RTL));
                if (paddingTop != 0 && paddingTop == paddingBottom && paddingBottom == paddingLeft && paddingLeft == paddingRight) {
                    node.delete('android', 'padding*')
                        .android('padding', Util.formatPX(paddingTop));
                }
                else {
                    if (paddingTop != 0 && paddingTop == paddingBottom) {
                        node.delete('android', 'paddingTop', 'paddingBottom')
                            .android('paddingVertical', Util.formatPX(paddingTop));
                    }
                    if (paddingLeft != 0 && paddingLeft == paddingRight) {
                        node.delete('android', paddingLeft_RTL, paddingRight_RTL)
                            .android('paddingHorizontal', Util.formatPX(paddingLeft));
                    }
                }
            }
        }
    }
}

function setLayoutWeight() {
    for (const node of NODE_CACHE) {
        const rows = node.linearRows;
        if (rows.length > 1) {
            const columnLength = rows[0].renderChildren.length;
            if (rows.reduce((a, b) => (a && a == b.renderChildren.length ? a: 0), columnLength) > 0) {
                const horizontal = !node.isHorizontal();
                const columnDimension = new Array(columnLength).fill(Number.MIN_VALUE);
                for (const row of rows) {
                    for (let i = 0; i < row.renderChildren.length; i++) {
                        columnDimension[i] = Math.max(row.renderChildren[i].linear[(horizontal ? 'width' : 'height')], columnDimension[i]);
                    }
                }
                const total = columnDimension.reduce((a, b) => a + b);
                const percent = columnDimension.map(value => Math.floor((value * 100) / total));
                percent[percent.length - 1] += 100 - percent.reduce((a, b) => a + b);
                for (const row of rows) {
                    for (let i = 0; i < row.renderChildren.length; i++) {
                        const column = row.renderChildren[i];
                        column
                            .android(`layout_${(horizontal ? 'width' : 'height')}`, '0px')
                            .android('layout_weight', (percent[i] / 100).toFixed(2));
                    }
                }
            }
        }
    }
}

function generateNodeId() {
    return NODE_CACHE.length + 1;
}

function setNodeCache() {
    let nodeTotal = 0;
    document.body.childNodes.forEach(element => {
        if (element.nodeName == '#text') {
            if (element.textContent.trim() != '') {
                nodeTotal++;
            }
        }
        else {
            if (Element.isVisible(element)) {
                nodeTotal++;
            }   
        }
    });
    const elements = document.querySelectorAll((nodeTotal > 1 ? 'body, body *' : 'body *'));
    for (const i in elements) {
        const element = elements[i];
        if (INLINE_CHROME.includes(element.tagName) && (MAPPING_CHROME[element.parentNode.tagName] != null || INLINE_CHROME.includes(element.parentNode.tagName))) {
            continue;
        }
        if (Element.isVisible(element)) {
            const node = new Node(generateNodeId(), element, SETTINGS.targetAPI);
            NODE_CACHE.push(node);
        }
    }
    const preAlignment = {};
    for (const node of NODE_CACHE) {
        preAlignment[node.id] = {};
        const style = preAlignment[node.id];
        switch (node.style.textAlign) {
            case 'center':
            case 'right':
            case 'end':
                style.textAlign = node.style.textAlign;
                node.element.style.textAlign = '';
                break;
        }
        style.verticalAlign = node.styleMap.verticalAlign || '';
        node.element.style.verticalAlign = 'top';
        if (node.overflow != 0) {
            if (Util.hasValue(node.styleMap.width)) {
                style.width = node.styleMap.width;
                node.element.style.width = '';
            }
            if (Util.hasValue(node.styleMap.height)) {
                style.height = node.styleMap.height;
                node.element.style.height = '';
            }
            style.overflow = node.style.overflow;
            node.element.style.overflow = 'visible';
        }
    }
    const parentNodes = {};
    const textNodes = new NodeList();
    for (const parent of NODE_CACHE) {
        if (parent.bounds == null) {
            parent.setBounds();
        }
        for (const child of NODE_CACHE) {
            if (parent != child) {
                if (child.bounds == null) {
                    child.setBounds();
                }
                if ((!child.fixed && child.parentElement == parent.element) || (child.fixed && child.box.left >= parent.linear.left && child.box.right <= parent.linear.right && child.box.top >= parent.linear.top && child.box.bottom <= parent.linear.bottom)) {
                    if (parentNodes[child.id] == null) {
                        parentNodes[child.id] = [];
                    }
                    parentNodes[child.id].push(parent);
                    parent.children.push(child);
                }
            }
        }
    }
    for (const node of NODE_CACHE) {
        const nodes = parentNodes[node.id];
        if (nodes != null) {
            let parent = node.parentElement.androidNode;
            if (node.fixed) {
                if (nodes.length > 1) {
                    let minArea = Number.MAX_VALUE;
                    for (const current of nodes) {
                        const area = (current.box.left - node.linear.left) + (current.box.right - node.linear.right) + (current.box.top - node.linear.top) + (current.box.bottom - node.linear.bottom);
                        if (area < minArea) {
                            parent = current;
                            minArea = area;
                        }
                        else if (area == minArea) {
                            if (current.element == node.parentElement) {
                                parent = current;
                            }
                        }
                    }
                    node.parent = parent;
                }
                else {
                    node.parent = nodes[0];
                }
            }
            else {
                node.parent = parent;
            }
        }
        if (node.element.children.length > 1) {
            node.element.childNodes.forEach(element => {
                if (element.nodeName == '#text' && element.textContent.trim() != '') {
                    const textNode = Node.createTextNode(generateNodeId() + textNodes.length, element, SETTINGS.targetAPI, node, [0, 4]);
                    textNodes.push(textNode);
                    node.children.push(textNode);
                }
            });
        }
    }
    NODE_CACHE.push(...textNodes);
    for (const node in preAlignment) {
        for (const attr in node.style) {
            node.element.style[attr] = node.style[attr];
        }
    }
    Util.sortAsc(NODE_CACHE, 'depth', 'parent.id', 'parentIndex', 'id');
    for (const node of NODE_CACHE) {
        let i = 0;
        Array.from(node.element.childNodes).forEach(item => {
            if (item.androidNode != null && item.androidNode.parent.element == node.element) {
                item.androidNode.parentIndex = i++;
            }
        });
        node.children.sortAsc('parentIndex');
    }
}

export function parseDocument() {
    let output = `${STRING_ANDROID.XML_DECLARATION}\n{0}`;
    const mapX = [];
    const mapY = [];
    setStyleMap();
    setNodeCache();
    for (const node of NODE_CACHE) {
        const x = Math.floor(node.bounds.x);
        const y = node.parent.id;
        if (mapX[node.depth] == null) {
            mapX[node.depth] = {};
        }
        if (mapY[node.depth] == null) {
            mapY[node.depth] = {};
        }
        if (mapX[node.depth][x] == null) {
            mapX[node.depth][x] = new NodeList();
        }
        if (mapY[node.depth][y] == null) {
            mapY[node.depth][y] = new NodeList();
        }
        mapX[node.depth][x].push(node);
        mapY[node.depth][y].push(node);
    }
    for (let i = 0; i < mapY.length; i++) {
        const coordsY = Object.keys(mapY[i]);
        const partial = new Map();
        for (let j = 0; j < coordsY.length; j++) {
            const axisY = [];
            const layers = [];
            for (const node of mapY[i][coordsY[j]]) {
                switch (node.style.position) {
                    case 'absolute':
                    case 'relative':
                    case 'fixed':
                        layers.push(node);
                        break;
                    default:
                        axisY.push(node);
                }
            }
            axisY.sort((a, b) => {
                if (!a.parent.flex.enabled && !b.parent.flex.enabled && a.withinX(b.linear)) {
                    return (a.linear.left > b.linear.left ? 1 : -1);
                }
                return (a.parentIndex > b.parentIndex ? 1 : -1);
            });
            axisY.push(...Util.sortAsc(layers, 'style.zIndex', 'parentIndex'));
            for (let k = 0; k < axisY.length; k++) {
                const nodeY = axisY[k];
                if (!nodeY.renderParent) {
                    const parent = nodeY.parent;
                    let tagName = nodeY.widgetName;
                    let restart = false;
                    let xml = '';
                    if (tagName == null) {
                        if ((nodeY.children.length == 0 && Element.hasFreeFormText(nodeY.element)) || nodeY.children.every(item => INLINE_CHROME.includes(item.tagName))) {
                            tagName = WIDGET_ANDROID.TEXT;
                        }
                        else if (nodeY.children.length > 0) {
                            const rows = nodeY.children;
                            if (SETTINGS.useGridLayout && !nodeY.flex.enabled && rows.length > 1 && rows.every(item => (BLOCK_CHROME.includes(item.tagName) && item.children.length > 0))) {
                                let columns = [];
                                let columnEnd = [];
                                if (SETTINGS.useLayoutWeight) {
                                    const dimensions = [];
                                    for (let l = 0; l < rows.length; l++) {
                                        const children = rows[l].children;
                                        dimensions[l] = [];
                                        for (let m = 0; m < children.length; m++) {
                                            dimensions[l].push(children[m].bounds.width);
                                        }
                                        columns.push(children);
                                    }
                                    const base = columns[
                                        dimensions.findIndex(item => {
                                            return (item == dimensions.reduce((a, b) => {
                                                if (a.length == b.length) {
                                                    return (a.reduce((c, d) => c + d, 0) < b.reduce((c, d) => c + d, 0) ? a : b);
                                                }
                                                else {
                                                    return (a.length < b.length ? a : b);
                                                }
                                            }));
                                        })];
                                    if (base.length > 1) {
                                        let maxIndex = -1;
                                        let assigned = [];
                                        let every = false;
                                        for (let l = 0; l < base.length; l++) {
                                            const bounds = base[l].bounds;
                                            const found = [];
                                            if (l < base.length - 1) {
                                                for (let m = 0; m < columns.length; m++) {
                                                    if (columns[m] == base) {
                                                        found.push(l);
                                                    }
                                                    else {
                                                        const index = columns[m].findIndex((item, index) => (index >= l && item.bounds.width == bounds.width && index < columns[m].length - 1));
                                                        if (index != -1) {
                                                            found.push(index);
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
                                                        columns[m][assigned[m] + (every ? 1 : 0)].gridSiblings = [...removed];
                                                    }
                                                }
                                            }
                                            if (found.length == columns.length) {
                                                const minIndex = found.reduce((a, b) => Math.min(a, b));
                                                maxIndex = found.reduce((a, b) => Math.max(a, b));
                                                if (maxIndex > minIndex) {
                                                    for (let m = 0; m < columns.length; m++) {
                                                        if (found[m] > minIndex) {
                                                            const removed = columns[m].splice(minIndex, found[m] - minIndex);
                                                            columns[m][assigned[m]].gridSiblings = [...removed];
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
                                    const nextMapX = mapX[nodeY.depth + 2];
                                    const nextCoordsX = (nextMapX ? Object.keys(nextMapX) : []);
                                    if (nextCoordsX.length > 1) {
                                        const columnRight = [];
                                        for (let l = 0; l < nextCoordsX.length; l++) {
                                            const nextAxisX = nextMapX[nextCoordsX[l]].sortAsc('bounds.top');
                                            columnRight[l] = (l == 0 ? Number.MIN_VALUE : columnRight[l - 1]);
                                            for (let m = 0; m < nextAxisX.length; m++) {
                                                const nextX = nextAxisX[m];
                                                if (nextX.parent.parent != null && nodeY.id == nextX.parent.parent.id) {
                                                    const [left, right] = [nextX.bounds.left, nextX.bounds.right];
                                                    if (l == 0 || left >= columnRight[l - 1]) {
                                                        if (columns[l] == null) {
                                                            columns[l] = [];
                                                        }
                                                        columns[l].push(nextX);
                                                    }
                                                    columnRight[l] = Math.max(right, columnRight[l]);
                                                }
                                            }
                                        }
                                        for (let l = 0, m = -1; l < columnRight.length; l++) {
                                            if (m == -1 && columns[l] == null) {
                                                m = l - 1;
                                            }
                                            else if (columns[l] == null) {
                                                if (m != -1 && l == columnRight.length - 1) {
                                                    columnRight[m] = columnRight[l];
                                                }
                                                continue;
                                            }
                                            else if (m != -1) {
                                                columnRight[m] = columnRight[l - 1];
                                                m = -1;
                                            }
                                        }
                                        for (let l = 0; l < columns.length; l++) {
                                            if (columns[l] != null) {
                                                columnEnd.push(columnRight[l]);
                                            }
                                        }
                                        columns = columns.filter(item => item);
                                        const columnLength = columns.reduce((a, b) => Math.max(a, b.length), 0);
                                        for (let l = 0; l < columnLength; l++) {
                                            let top = null;
                                            for (let m = 0; m < columns.length; m++) {
                                                const nodeX = columns[m][l];
                                                if (nodeX != null) {
                                                    if (top == null) {
                                                        top = nodeX.bounds.top;
                                                    }
                                                    else if (nodeX.bounds.top != top) {
                                                        const nextRowX = columns[m - 1][l + 1];
                                                        if (columns[m][l - 1] == null || (nextRowX != null && nextRowX.bounds.top == nodeX.bounds.top)) {
                                                            columns[m].splice(l, 0, { spacer: 1 });
                                                        }
                                                        else if (columns[m][l + 1] == null) {
                                                            columns[m][l + 1] = nodeX;
                                                            columns[m][l] = { spacer: 1 };
                                                        }
                                                    }
                                                }
                                                else {
                                                    columns[m].splice(l, 0, { spacer: 1 });
                                                }
                                            }
                                        }
                                    }
                                }
                                if (columns.length > 1) {
                                    nodeY.gridColumnEnd = columnEnd;
                                    nodeY.gridColumnCount = (SETTINGS.useLayoutWeight ? columns[0].length : columns.length);
                                    xml += writeGridLayout(nodeY, parent, nodeY.gridColumnCount);
                                    for (let l = 0, count = 0; l < columns.length; l++) {
                                        let spacer = 0;
                                        for (let m = 0, start = 0; m < columns[l].length; m++) {
                                            const node = columns[l][m];
                                            if (!node.spacer) {
                                                node.parent.hide();
                                                node.parent = nodeY;
                                                if (SETTINGS.useLayoutWeight) {
                                                    node.gridRowStart = (m == 0);
                                                    node.gridRowEnd = (m == columns[l].length - 1);
                                                    node.gridFirst = (l == 0 && m == 0);
                                                    node.gridLast = (l == columns.length - 1 && node.gridRowEnd);
                                                    node.gridIndex = m;
                                                }
                                                else {
                                                    let rowSpan = 1;
                                                    let columnSpan = 1 + spacer;
                                                    for (let n = l + 1; n < columns.length; n++) {
                                                        if (columns[n][m].spacer == 1) {
                                                            columnSpan++;
                                                            columns[n][m].spacer = 2;
                                                        }
                                                        else {
                                                            break;
                                                        }
                                                    }
                                                    if (columnSpan == 1) {
                                                        for (let n = m + 1; n < columns[l].length; n++) {
                                                            if (columns[l][n].spacer == 1) {
                                                                rowSpan++;
                                                                columns[l][n].spacer = 2;
                                                            }
                                                            else {
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    if (rowSpan > 1) {
                                                        node.android('layout_rowSpan', rowSpan);
                                                    }
                                                    if (columnSpan > 1) {
                                                        node.android('layout_columnSpan', columnSpan);
                                                    }
                                                    node.gridRowStart = (start++ == 0);
                                                    node.gridRowEnd = (columnSpan + l == columns.length);
                                                    node.gridFirst = (count++ == 0);
                                                    node.gridLast = (node.gridRowEnd && m == columns[l].length - 1);
                                                    node.gridIndex = l;
                                                    spacer = 0;
                                                }
                                            }
                                            else if (node.spacer == 1) {
                                                spacer++;
                                            }
                                        }
                                    }
                                }
                            }
                            if (!nodeY.renderParent) {
                                const [linearX, linearY] = [nodeY.children.linearX, nodeY.children.linearY];
                                if (linearX && linearY) {
                                    xml += writeFrameLayout(nodeY, parent);
                                }
                                else if (!nodeY.flex.enabled && (linearX || linearY)) {
                                    xml += writeLinearLayout(nodeY, parent, linearY);
                                }
                                else {
                                    xml += writeDefaultLayout(nodeY, parent);
                                }
                            }
                        }
                        else {
                            continue;
                        }
                    }
                    if (!nodeY.renderParent) {
                        if (parent.isView(WIDGET_ANDROID.GRID)) {
                            let siblings = null;
                            if (SETTINGS.useLayoutWeight) {
                                siblings = new NodeList(nodeY.gridSiblings);
                            }
                            else {
                                const columnEnd = parent.gridColumnEnd[nodeY.gridIndex + (nodeY.android('layout_columnSpan') || 1) - 1];
                                siblings = nodeY.parentOriginal.children.filter(item => !item.renderParent && item.bounds.left >= nodeY.bounds.right && item.bounds.right <= columnEnd);
                            }
                            if (siblings.length > 0) {
                                siblings.unshift(nodeY);
                                siblings.sortAsc('bounds.x');
                                const renderParent = parent;
                                const wrapNode = Node.createWrapNode(generateNodeId(), nodeY, SETTINGS.targetAPI, parent, siblings, [0]);
                                NODE_CACHE.push(wrapNode);
                                const rowSpan = nodeY.android('layout_rowSpan');
                                const columnSpan = nodeY.android('layout_columnSpan');
                                if (rowSpan > 1) {
                                    nodeY.delete('android', 'layout_rowSpan');
                                    wrapNode.android('layout_rowSpan', rowSpan);
                                }
                                if (columnSpan > 1) {
                                    nodeY.delete('android', 'layout_columnSpan');
                                    wrapNode.android('layout_columnSpan', columnSpan);
                                }
                                for (const node of siblings) {
                                    node.parent = wrapNode;
                                    wrapNode.inheritGrid(node);
                                }
                                wrapNode.setBounds();
                                if (siblings.linearX || siblings.linearY) {
                                    xml += writeLinearLayout(wrapNode, renderParent, siblings.linearY);
                                }
                                else {
                                    xml += writeDefaultLayout(wrapNode, renderParent);
                                }
                                k--;
                                restart = true;
                            }
                        }
                        if (!nodeY.renderParent && !restart) {
                            const element = nodeY.element;
                            switch (element.tagName) {
                                case 'INPUT':
                                    if (element.type == 'radio') {
                                        const result = nodeY.parentOriginal.children.filter(item => (item.element.type == 'radio' && item.element.name == element.name));
                                        let radioXml = '';
                                        if (result.length > 1) {
                                            let rowSpan = 1;
                                            let columnSpan = 1;
                                            let checked = null;
                                            const wrapNode = Node.createWrapNode(generateNodeId(), nodeY, SETTINGS.targetAPI, parent, result);
                                            NODE_CACHE.push(wrapNode);
                                            wrapNode.setAndroidId(WIDGET_ANDROID.RADIO_GROUP);
                                            wrapNode.render(parent);
                                            for (const node of result) {
                                                rowSpan += (Util.convertToInt(node.android('layout_rowSpan')) || 1) - 1;
                                                columnSpan += (Util.convertToInt(node.android('layout_columnSpan')) || 1) - 1;
                                                wrapNode.inheritGrid(node);
                                                if (node.element.checked) {
                                                    checked = node;
                                                }
                                                node.parent = wrapNode;
                                                node.render(wrapNode);
                                                radioXml += renderViewTag(node, wrapNode, WIDGET_ANDROID.RADIO);
                                            }
                                            if (rowSpan > 1) {
                                                wrapNode.android('layout_rowSpan', rowSpan);
                                            }
                                            if (columnSpan > 1) {
                                                wrapNode.android('layout_columnSpan', columnSpan);
                                            }
                                            wrapNode
                                                .android('orientation', (result.linearX ? 'horizontal' : 'vertical'))
                                                .android('checkedButton', checked.stringId);
                                            wrapNode.setBounds();
                                            wrapNode.setAttributes();
                                            xml += getEnclosingTag(wrapNode.renderDepth, WIDGET_ANDROID.RADIO_GROUP, wrapNode.id, radioXml, insertGridSpace(wrapNode));
                                        }
                                        break;
                                    }
                                default:
                                    xml += renderViewTag(nodeY, parent, tagName);
                            }
                        }
                    }
                    if (xml != '') {
                        if (!partial.has(parent.id)) {
                            partial.set(parent.id, []);
                        }
                        partial.get(parent.id).push(xml);
                    }
                }
            }
        }
        for (const [id, views] of partial.entries()) {
            output = output.replace(`{${id}}`, views.join(''));
        }
    }
    setResourceStyle();
    if (SETTINGS.showAttributes) {
        setMarginPadding();
        if (SETTINGS.useLayoutWeight) {
            setLayoutWeight();
        }
        setAccessibility();
        setConstraints();
        output = insetAttributes(output);
    }
    else {
        output = output.replace(/{@[0-9]+}/g, '');
    }
    if (SETTINGS.useUnitDP) {
        output = Util.insetToDP(output, SETTINGS.density);
    }
    return output;
}

export const settings = SETTINGS;
export { BUILD_ANDROID, DENSITY_ANDROID };
export { writeResourceDrawableXml, writeResourceColorXml, writeResourceStyleXml, writeResourceArrayXml, writeResourceStringXml };
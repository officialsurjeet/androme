import { Null, ObjectIndex, PlainFile, StringMap, ViewData } from '../lib/types';
import Controller from './controller';
import Extension from './extension';
import Resource from './resource';
import Node from './node';
import NodeList from './nodelist';
import { hasValue, hyphenToCamelCase, resetId, sortAsc, trim } from '../lib/util';
import { indentLines, removePlaceholders, replaceDP } from '../lib/xml';
import { convertRGB, getByColorName, parseRGBA } from '../lib/color';
import { hasFreeFormText, isVisible } from '../lib/dom';
import { INLINE_CHROME, MAPPING_CHROME, VIEW_STANDARD, OVERFLOW_CHROME } from '../lib/constants';
import SETTINGS from '../settings';

export default class Application<T extends Node, U extends NodeList<T>> {
    public cache: U;
    public cacheInternal: U;
    public controllerHandler: Controller<T, U>;
    public resourceHandler: Resource<T>;
    public elements: Set<HTMLElement> = new Set();
    public insert: ObjectIndex<string> = {};

    private views: PlainFile[] = [];
    private includes: PlainFile[] = [];
    private currentIndex = -1;
    private _extensions: Extension<T, U>[] = [];
    private _closed = false;

    constructor(
        private TypeT: { new (id: number, api: number, element?: HTMLElement, options?: any): T },
        private TypeU: { new (nodes?: T[], parent?: T): U })
    {
        this.cache = new this.TypeU();
        this.cacheInternal = new this.TypeU();
    }

    public registerController(controllerHandler: Controller<T, U>) {
        controllerHandler.cache = this.cache;
        this.controllerHandler = controllerHandler;
    }

    public registerResource(resource: Resource<T>) {
        resource.cache = this.cache;
        this.resourceHandler = resource;
    }

    public registerExtension(extension: Extension<T, U>) {
        const found = this.findExtension(extension.name);
        if (found != null) {
            found.tagNames = extension.tagNames;
            Object.assign(found.options, extension.options);
        }
        else {
            if (extension.dependencies.every(item => this.findExtension(item.name) != null)) {
                extension.application = this;
                this._extensions.push(extension);
            }
        }
    }

    public finalize() {
        this.controllerHandler.setDimensions(this.viewData);
        this.setAuxillaryViews();
        this.resourceHandler.finalize(this.viewData);
        if (SETTINGS.showAttributes) {
            this.setAttributes();
        }
        this.layouts.forEach(layout => {
            layout.content = removePlaceholders(layout.content);
            if (SETTINGS.dimensResourceValue) {
                layout.content = this.controllerHandler.parseDimensions(layout.content);
            }
            if (SETTINGS.useUnitDP) {
                layout.content = replaceDP(layout.content, SETTINGS.density);
            }
        });
        this._closed = true;
    }

    public reset() {
        resetId();
        this.cacheInternal.list.forEach(node => {
            const element: any = node.element;
            delete element.__boxSpacing;
            delete element.__boxStyle;
            delete element.__fontStyle;
            delete element.__imageSource;
            delete element.__optionArray;
            delete element.__valueString;
        });
        this.cache.reset();
        this.cacheInternal.reset();
        this.resetController();
        this.resetResource();
        this.appName = '';
        this.views = [];
        this.includes = [];
        this.insert = {};
        this.currentIndex = -1;
        this._closed = false;
    }

    public resetController() {
        this.controllerHandler.reset();
    }

    public resetResource() {
        this.resourceHandler.reset();
    }

    public setConstraints() {
        this.controllerHandler.setConstraints();
    }

    public setMarginPadding() {
        this.controllerHandler.setMarginPadding();
    }

    public setResources() {
        this.resourceHandler.setFontStyle();
        this.resourceHandler.setBoxSpacing();
        this.resourceHandler.setBoxStyle();
        this.resourceHandler.setValueString();
        this.resourceHandler.setOptionArray();
        this.resourceHandler.setImageSource();
    }

    public setStyleMap() {
        let cssWarning = false;
        for (let i = 0; i < document.styleSheets.length; i++) {
            const styleSheet = (<CSSStyleSheet> document.styleSheets[i]);
            try {
                for (let j = 0; j < styleSheet.cssRules.length; j++) {
                    const cssRule = (<CSSStyleRule> styleSheet.cssRules[j]);
                    const attributes: Set<string> = new Set();
                    for (const attr of Array.from(cssRule.style)) {
                        attributes.add(hyphenToCamelCase(attr));
                    }
                    const elements = document.querySelectorAll(cssRule.selectorText);
                    if (this.appName !== '') {
                        Array.from(elements).forEach((element: HTMLElement) => {
                            const object = (<any> element);
                            delete object.__style;
                            delete object.__styleMap;
                        });
                    }
                    Array.from(elements).forEach((element: HTMLElement) => {
                        for (const attr of Array.from(element.style)) {
                            attributes.add(hyphenToCamelCase(attr));
                        }
                        const style: any = getComputedStyle(element);
                        const styleMap: StringMap = {};
                        for (const name of attributes) {
                            if (name.toLowerCase().indexOf('color') !== -1) {
                                const color = getByColorName((<any> cssRule.style)[name]);
                                if (color !== '') {
                                    (<any> cssRule.style)[name] = convertRGB(color);
                                }
                            }
                            if (hasValue((<any> element.style)[name])) {
                                styleMap[name] = (<any> element.style)[name];
                            }
                            else if (style[name] === (<any> cssRule.style)[name]) {
                                styleMap[name] = style[name];
                            }
                        }
                        const object = (<any> element);
                        if (object.__styleMap != null) {
                            Object.assign(object.__styleMap, styleMap);
                        }
                        else {
                            object.__style = style;
                            object.__styleMap = styleMap;
                        }
                    });
                }
            }
            catch (error) {
                if (!cssWarning) {
                    alert('External CSS files cannot be parsed when loading this program from your hard drive with Chrome 64+ (file://). Either use a local web ' +
                          'server (http://), embed your CSS files into a <style> tag, or use a different browser. See the README for further instructions.\n\n' +
                          `${styleSheet.href}\n\n${error}`);
                    cssWarning = true;
                }
            }
        }
    }

    public createNodeCache(root: HTMLElement) {
        let nodeTotal = 0;
        if (root === document.body) {
            Array.from(document.body.childNodes).forEach((item: HTMLElement) => {
                if (item.nodeName === '#text') {
                    if (item.textContent && item.textContent.trim() !== '') {
                        nodeTotal++;
                    }
                }
                else {
                    if (isVisible(item)) {
                        nodeTotal++;
                    }
                }
            });
        }
        const elements = (root !== document.body ? root.querySelectorAll('*') : document.querySelectorAll((nodeTotal > 1 ? 'body, body *' : 'body *')));
        this.cache.parent = undefined;
        this.cache.clear();
        const extensions = this.extensions;
        extensions.forEach(item => {
            item.parent = null;
            item.node = (<T> {});
            item.element = root;
            item.beforeInit();
        });
        if (root != null) {
            const node = this.insertNode(root);
            if (node != null) {
                node.parent = new this.TypeT(0, 0);
                this.cache.parent = node;
            }
        }
        extensions.forEach(item => item.node = (<T> this.cache.parent));
        for (const element of (<HTMLElement[]> Array.from(elements))) {
            if (!this.elements.has(element)) {
                let handled = false;
                extensions.some(item => {
                    if (item.init(element)) {
                        handled = true;
                        return true;
                    }
                    return false;
                });
                if (!handled) {
                    if (INLINE_CHROME.includes(element.tagName) && element.parentElement && (MAPPING_CHROME[element.parentElement.tagName] != null || INLINE_CHROME.includes(element.parentElement.tagName))) {
                        continue;
                    }
                    let valid = true;
                    let current = element.parentElement;
                    while (current != null) {
                        if (current === root) {
                            break;
                        }
                        else if (current !== root && this.elements.has(current)) {
                            valid = false;
                            break;
                        }
                        current = current.parentElement;
                    }
                    if (valid) {
                        this.insertNode(element);
                    }
                }
            }
        }
        if (this.cache.list.length > 0) {
            const preAlignment: ObjectIndex<any> = {};
            this.cache.list.forEach(node => {
                const element = node.element;
                preAlignment[node.id] = {};
                const style = preAlignment[node.id];
                switch (node.styleMap.textAlign) {
                    case 'center':
                    case 'right':
                    case 'end':
                        style.textAlign = node.style.textAlign;
                        element.style.textAlign = '';
                        break;
                }
                style.verticalAlign = node.styleMap.verticalAlign || '';
                element.style.verticalAlign = 'top';
                if (node.overflow !== OVERFLOW_CHROME.NONE) {
                    if (hasValue(node.styleMap.width)) {
                        style.width = node.styleMap.width;
                        element.style.width = '';
                    }
                    if (hasValue(node.styleMap.height)) {
                        style.height = node.styleMap.height;
                        element.style.height = '';
                    }
                    style.overflow = node.style.overflow;
                    element.style.overflow = 'visible';
                }
                node.setBounds();
            });
            const parents: ObjectIndex<T[]> = {};
            this.cache.list.forEach(parent => {
                this.cache.list.forEach(child => {
                    if (parent !== child) {
                        if (child.element && child.element.parentElement === parent.element) {
                            child.parent = parent;
                            parent.children.push(child);
                        }
                        if (child.fixed && child.box.left >= parent.linear.left && child.box.right <= parent.linear.right && child.box.top >= parent.linear.top && child.box.bottom <= parent.linear.bottom) {
                            if (parents[child.id] == null) {
                                parents[child.id] = [];
                            }
                            parents[child.id].push(parent);
                        }
                    }
                });
            });
            this.cache.list.forEach(node => {
                const nodes: T[] = parents[node.id];
                if (nodes != null) {
                    nodes.push((<T> node.parent));
                    let minArea = Number.MAX_VALUE;
                    let closest: Null<T> = null;
                    nodes.forEach(current => {
                        const area = (current.box.left - node.linear.left) + (current.box.right - node.linear.right) + (current.box.top - node.linear.top) + (current.box.bottom - node.linear.bottom);
                        if (area < minArea) {
                            closest = current;
                            minArea = area;
                        }
                        else if (area === minArea) {
                            if (current.element === node.parent.element) {
                                closest = current;
                            }
                        }
                    });
                    if (closest != null) {
                        node.parent = closest;
                    }
                }
                if (node.element && node.element.children.length > 0 && !node.children.every((current: T) => INLINE_CHROME.includes(current.tagName))) {
                    Array.from(node.element.childNodes).forEach((element: HTMLElement) => {
                        if (element.nodeName === '#text' && element.textContent && element.textContent.trim() !== '') {
                            this.insertNode(element, node);
                        }
                    });
                }
            });
            this.cache.list.forEach(node => {
                if (node.hasElement) {
                    const style = preAlignment[node.id];
                    if (style != null) {
                        for (const attr in style) {
                            (<any> node.element).style[attr] = style[attr];
                        }
                    }
                }
            });
            extensions.forEach(item => {
                item.parent = null;
                item.node = (<T> this.cache.parent);
                item.element = root;
                item.afterInit();
            });
            this.cache.sortAsc('depth', 'parent.id', 'parentIndex', 'id');
            this.cache.list.forEach(node => {
                if (node.hasElement) {
                    let i = 0;
                    Array.from(node.element.childNodes).forEach((element: any) => {
                        if (element.__node != null && (element.__node.parent.element === node.element)) {
                            element.__node.parentIndex = i++;
                        }
                    });
                    sortAsc(node.children, 'parentIndex');
                }
            });
            this.addLayout((<string> root.dataset.currentId));
            return true;
        }
        return false;
    }

    public createLayoutXml() {
        let output = `<?xml version="1.0" encoding="utf-8"?>\n{:0}`;
        let empty = true;
        const mapX: any = [];
        const mapY: any = [];
        const extensions = this.extensions;
        this.cache.list.forEach(node => {
            const x = Math.floor(<number> node.bounds.x);
            const y = node.parent.id;
            if (mapX[node.depth] == null) {
                mapX[node.depth] = {};
            }
            if (mapY[node.depth] == null) {
                mapY[node.depth] = {};
            }
            if (mapX[node.depth][x] == null) {
                mapX[node.depth][x] = new this.TypeU();
            }
            if (mapY[node.depth][y] == null) {
                mapY[node.depth][y] = new this.TypeU();
            }
            mapX[node.depth][x].list.push(node);
            mapY[node.depth][y].list.push(node);
        });
        for (let i = 0; i < mapY.length; i++) {
            const coordsY = Object.keys(mapY[i]);
            const partial = new Map();
            for (let j = 0; j < coordsY.length; j++) {
                const axisY: T[] = [];
                const layers: T[] = [];
                for (const node of (<T[]> mapY[i][coordsY[j]].list)) {
                    switch (node.css('position')) {
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
                    if (a.linear.left !== b.linear.left && !a.parent.flex.enabled && !b.parent.flex.enabled && a.withinX(b.linear)) {
                        return (a.linear.left > b.linear.left ? 1 : -1);
                    }
                    return (a.parentIndex > b.parentIndex ? 1 : -1);
                });
                axisY.push(...sortAsc(layers, 'style.zIndex', 'parentIndex'));
                for (let k = 0; k < axisY.length; k++) {
                    const nodeY = axisY[k];
                    const parent = (<T> nodeY.parent);
                    if (!nodeY.renderParent) {
                        let xml = '';
                        let append = '';
                        let restart = false;
                        let proceed = false;
                        const renderExtension = (<Extension<T, U>> parent.renderExtension);
                        if (renderExtension != null) {
                            renderExtension.node = nodeY;
                            renderExtension.parent = parent;
                            renderExtension.element = nodeY.element;
                            [append, restart, proceed] = renderExtension.processChild();
                            if (append !== '') {
                                xml += append;
                                if (restart) {
                                    k--;
                                }
                            }
                            if (proceed) {
                                continue;
                            }
                        }
                        extensions.some(item => {
                            if (nodeY.renderExtension == null && item.is(nodeY)) {
                                item.parent = parent;
                                item.node = nodeY;
                                item.element = nodeY.element;
                                if (item.condition()) {
                                    [append, restart, proceed] = item.processNode(mapX, mapY);
                                    if (append !== '') {
                                        xml += append;
                                        if (restart && nodeY === axisY[k]) {
                                            k--;
                                        }
                                    }
                                    nodeY.renderExtension = item;
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (proceed) {
                            continue;
                        }
                        if (xml === '') {
                            let tagName = nodeY.viewName;
                            if (tagName === '') {
                                if (nodeY.children.length > 0 && nodeY.cascade().some(node => MAPPING_CHROME[node.tagName] != null || !INLINE_CHROME.includes(node.tagName))) {
                                    const [linearX, linearY] = [NodeList.linearX(nodeY.children), NodeList.linearY(nodeY.children)];
                                    if (!nodeY.renderParent) {
                                        if (nodeY.children.length === 1 && linearX && linearY) {
                                            if (nodeY.viewWidth === 0 && nodeY.viewHeight === 0 && nodeY.marginTop === 0 && nodeY.marginRight === 0 && nodeY.marginBottom === 0 && nodeY.marginLeft === 0 && nodeY.paddingTop === 0 && nodeY.paddingRight === 0 && nodeY.paddingBottom === 0 && nodeY.paddingLeft === 0 && parseRGBA(nodeY.css('background')).length === 0 && !this.controllerHandler.hasAppendProcessing(nodeY.id)) {
                                                nodeY.children[0].parent = parent;
                                                nodeY.cascade().forEach(item => item.renderDepth--);
                                                nodeY.hide();
                                                continue;
                                            }
                                            else {
                                                xml += this.writeFrameLayout(nodeY, parent);
                                            }
                                        }
                                        else if ((linearX || linearY) && (!nodeY.flex.enabled || (linearX && nodeY.children.every(node => node.flex.enabled))) && (!nodeY.children.some(node => node.floating && node.css('clear') !== 'none') && (nodeY.children.every(node => node.css('float') !== 'right') || nodeY.children.every(node => node.css('float') === 'right')))) {
                                            xml += this.writeLinearLayout(nodeY, parent, linearY);
                                        }
                                        else {
                                            xml += this.writeDefaultLayout(nodeY, parent);
                                        }
                                    }
                                }
                                else {
                                    if (nodeY.children.length === 0 && nodeY.element && !hasFreeFormText(nodeY.element)) {
                                        continue;
                                    }
                                    tagName = this.controllerHandler.getViewName(VIEW_STANDARD.TEXT);
                                }
                            }
                            if (!nodeY.renderParent) {
                                xml += this.writeView(nodeY, parent, tagName);
                            }
                        }
                        if (xml !== '') {
                            if (!partial.has(parent.id)) {
                                partial.set(parent.id, []);
                            }
                            partial.get(parent.id).push(xml);
                        }
                    }
                }
            }
            for (const [id, views] of partial.entries()) {
                const placeholder = `{:${id}}`;
                if (output.indexOf(placeholder) !== -1) {
                    output = output.replace(placeholder, views.join(''));
                    empty = false;
                }
                else {
                    this.insert[id] = views.join('');
                }
            }
        }
        let pathname = '';
        const root = (<T> this.cache.parent);
        const extension = (<Extension<T, U>> root.renderExtension);
        if (extension == null || root.options(`${extension.name}:insert`) == null) {
            if (root.element.dataset != null) {
                pathname = trim((root.element.dataset.pathname || '').trim(), '/');
            }
            this.setLayout(pathname, (!empty ? output : ''), (root.renderExtension != null && root.renderExtension.activityMain));
        }
        else {
            this.views.pop();
        }
        if (!empty) {
            extensions.forEach(item => {
                item.parent = null;
                item.node = root;
                item.element = null;
                item.afterRender();
            });
        }
        else {
            root.visible = false;
        }
        this.cacheInternal.list.push(...this.cache.list);
    }

    public writeFrameLayout(node: T, parent: T) {
        return this.controllerHandler.renderGroup(node, parent, VIEW_STANDARD.FRAME);
    }

    public writeLinearLayout(node: T, parent: T, vertical: boolean) {
        return this.controllerHandler.renderGroup(node, parent, VIEW_STANDARD.LINEAR, { android: { orientation: (vertical ? 'vertical' : 'horizontal') } });
    }

    public writeGridLayout(node: T, parent: T, columnCount: number, rowCount: number = 0) {
        return this.controllerHandler.renderGroup(node, parent, VIEW_STANDARD.GRID, { android: { columnCount: columnCount.toString(), rowCount: (rowCount > 0 ? rowCount.toString() : '') } });
    }

    public writeRelativeLayout(node: T, parent: T) {
        return this.controllerHandler.renderGroup(node, parent, VIEW_STANDARD.RELATIVE);
    }

    public writeConstraintLayout(node: T, parent: T) {
        return this.controllerHandler.renderGroup(node, parent, VIEW_STANDARD.CONSTRAINT);
    }

    public writeView(node: T, parent: T, viewName: number | string) {
        return this.controllerHandler.renderView(node, parent, viewName);
    }

    public writeDefaultLayout(node: T, parent: T) {
        if (SETTINGS.useConstraintLayout || node.flex.enabled) {
            return this.writeConstraintLayout(node, parent);
        }
        else {
            return this.writeRelativeLayout(node, parent);
        }
    }

    public setAttributes() {
        this.controllerHandler.setAttributes(this.viewData);
    }

    public setAuxillaryViews() {
        const viewIds = Object.keys(this.insert);
        viewIds.push(...viewIds.slice().reverse());
        [...this.views, ...this.includes].forEach(view => {
            viewIds.forEach(id => view.content = view.content.replace(`{:${id}}`, this.insert[parseInt(id)]));
            view.content = this.controllerHandler.insertAuxillaryViews(view.content);
        });
        this.cacheInternal.list.forEach(node => {
            if (!node.visible && node.renderExtension != null) {
                const insert = `${node.renderExtension.name}:insert`;
                let output = (<string> node.options(insert));
                if (output) {
                    output = this.controllerHandler.insertAuxillaryViews(output);
                    const children = this.insert[node.id];
                    if (children != null) {
                        output = output.replace(`{:${node.id}}`, children);
                    }
                    output = this.controllerHandler.insertAttributes(output, node);
                    output = indentLines(output.trim());
                    node.children.forEach(item => output = this.controllerHandler.insertAttributes(output, <T> item));
                    node.options(insert, output);
                }
            }
            this.extensions.forEach(item => {
                item.parent = null;
                item.node = node;
                item.element = node.element;
                if (item.condition()) {
                    item.finalize();
                }
            });
        });
    }

    public addLayout(value: string) {
        const layout: PlainFile = {
            filename: value,
            pathname: '',
            content: ''
        };
        this.currentIndex = this.views.length;
        this.views.push(layout);
    }

    public setLayout(pathname = '', content: string, activityMain = false) {
        pathname = pathname || 'res/layout';
        if (activityMain && this.views.length > 0 && this.views[0].content === '') {
            const view = this.views[0];
            const current = (<PlainFile> this.views.pop());
            view.pathname = pathname;
            view.filename = current.filename;
            view.content = content;
            this.currentIndex = 0;
        }
        else {
            const view = this.current;
            view.pathname = pathname;
            view.content = content;
        }
    }

    public addInclude(filename: string, content: string) {
        this.includes.push({
            pathname: 'res/layout',
            filename,
            content
        });
    }

    public findExtension(name: string) {
        return this._extensions.find(item => item.name === name);
    }

    public findByDomId(id: string) {
        return this.cacheInternal.list.find(node => node.element.id === id);
    }

    public toString() {
        return (this.views.length > 0 ? this.views[0].content : '');
    }

    private insertNode(element: HTMLElement, parent?: T) {
        let node: Null<T> = null;
        if (element.nodeName === '#text') {
            if (element.textContent && element.textContent.trim() !== '') {
                node = new this.TypeT(this.cache.nextId, SETTINGS.targetAPI, element, { parent, tagName: 'PLAINTEXT' });
                node.setBounds(false, element);
                if (parent != null) {
                    node.inheritStyle(parent);
                    parent.children.push(node);
                }
            }
        }
        else if (isVisible(element)) {
            node = new this.TypeT(this.cache.nextId, SETTINGS.targetAPI, element);
            if ((<any> element).__nodeIsolated) {
                node.isolated = true;
            }
        }
        if (node != null) {
            this.cache.list.push(node);
        }
        return node;
    }

    public set appName(value) {
        if (this.resourceHandler != null) {
            this.resourceHandler.file.appName = value;
        }
    }
    public get appName() {
        return (this.resourceHandler != null ? this.resourceHandler.file.appName : '');
    }

    public set current(value) {
        this.views[this.currentIndex] = value;
    }
    public get current() {
        return this.views[this.currentIndex];
    }

    get layouts() {
        return [...this.views, ...this.includes];
    }

    get closed() {
        return this._closed;
    }

    get extensions() {
        return this._extensions.filter(item => item.enabled);
    }

    public get viewData(): ViewData<T> {
        return { cache: this.cacheInternal.list, views: this.views, includes: this.includes };
    }

    public get size() {
        return this.views.length + this.includes.length;
    }
}
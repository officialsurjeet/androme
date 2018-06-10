import { BUILD_ANDROID, FIXED_ANDROID, MAPPING_CHROME, OVERFLOW_CHROME, WIDGET_ANDROID } from '../lib/constants';
import { API_ANDROID } from '../customizations';
import { calculateBias, convertInt, convertPX, formatPX, formatString, generateId, hasValue, isNumber } from '../lib/util';
import { parseStyle } from '../lib/element';
import * as Resource from '../resource';
import parseRTL from '../lib/localization';
import Node from '../base/node';

export default class Widget extends Node {
    public static is(object: any) {
        return (object instanceof Widget);
    }

    public actions: number[];
    public constraint: any = {};
    public labelFor: Widget;
    public linearRows: Widget[];
    public styleAttributes: string[] = [];

    public androidId: string;
    public androidWidgetName: string;
    public androidSrc: string;

    private _android: any;
    private _app: any;
    private _label: Widget;

    constructor(id: number, public api: number, element: any = null, options: any = {}) {
        super(id, element, options);

        if (options.element != null || element != null) {
            this.element.__node = this;
        }
    }

    public add(obj: string, attr: string, value = '', overwrite = true) {
        if (hasValue(attr) && !this.supported(obj, attr)) {
            return false;
        }
        return super.add(obj, attr, value, overwrite);
    }
    public android(attr: string, value: string = null, overwrite = true) {
        switch (arguments.length) {
            case 0:
                return this._android;
            case 1:
                return this._android && this._android[attr];
            default:
                this.add('android', attr, value, overwrite);
                return this;
        }
    }
    public app(attr: string, value: string = null, overwrite = true) {
        switch (arguments.length) {
            case 0:
                return this._app;
            case 1:
                return this._app && this._app[attr];
            default:
                this.add('app', attr, value, overwrite);
                return this;
        }
    }
    public attr(value: string, overwrite = true) {
        const match = value.match(/^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/);
        if (match != null) {
            this.add(match[1] || '_', match[2], match[3], overwrite);
        }
        return this;
    }
    public combine() {
        const result: string[] = [];
        this.namespaces.forEach(value => {
            const obj: {} = this[`_${value}`];
            for (const attr in obj) {
                if (value !== '_') {
                    result.push(`${value}:${attr}="${obj[attr]}"`);
                }
                else {
                    result.push(`${attr}="${obj[attr]}"`);
                }
            }
        });
        return result.sort();
    }
    public render(parent: Widget) {
        if (parent.is(WIDGET_ANDROID.LINEAR)) {
            switch (this.widgetName) {
                case WIDGET_ANDROID.LINEAR:
                case WIDGET_ANDROID.RADIO_GROUP:
                    parent.linearRows.push(this);
                    break;
            }
        }
        super.render(parent);
        return this;
    }
    public anchor(position: string, adjacent: any = {}, orientation = '') {
        const overwrite = (adjacent.stringId === 'parent');
        switch (this.renderParent.widgetName) {
            case WIDGET_ANDROID.CONSTRAINT:
                if (arguments.length === 1) {
                    return this.app(position);
                }
                this.app(position, adjacent.stringId, overwrite);
                break;
            case WIDGET_ANDROID.RELATIVE:
                if (arguments.length === 1) {
                    return this.android(position);
                }
                this.android(position, adjacent.stringId, overwrite);
                break;
        }
        if (orientation !== '') {
            this.constraint[orientation] = true;
        }
        return this;
    }
    public supported(obj: string, attr: string) {
        for (let i = this.api + 1; i < BUILD_ANDROID.OREO_1; i++) {
            const version = API_ANDROID[i];
            if (version != null && version[obj] != null && version[obj].includes(attr)) {
                return false;
            }
        }
        return true;
    }
    public applyCustomizations() {
        const api = API_ANDROID[this.api];
        if (api != null) {
            const customizations = api.customizations[this.widgetName];
            if (customizations != null) {
                for (const obj in customizations) {
                    for (const attr in customizations[obj]) {
                        this.add(obj, attr, customizations[obj][attr], false);
                    }
                }
            }
        }
    }
    public modifyBox(dimension: string, offset: number) {
        dimension = parseRTL(dimension);
        const total = formatPX(offset + convertInt(this.android(dimension)));
        this.css(dimension, total)
            .android(dimension, total);
        this.setBounds(true);
        return this;
    }
    public inheritStyle(node: Widget) {
        const inherit = Resource.ACTION_ANDROID[this.widgetName]['setComputedStyle'];
        const style = [];
        for (const attr in inherit) {
            let value = node.style[attr];
            this.style[attr] = value;
            value = parseStyle(null, attr, value);
            if (hasValue(value)) {
                style.push(formatString(inherit[attr], value));
            }
        }
        this.styleAttributes = style;
    }
    public is(...views: string[]) {
        for (const viewName of views) {
            if (this.widgetName === viewName) {
                return true;
            }
        }
        return false;
    }

    public setAndroidId(widgetName: string) {
        this.androidWidgetName = widgetName || this.widgetName;
        if (this.androidId == null) {
            this.androidId = generateId('android', this.element.id || this.element.name || `${this.androidWidgetName.substring(this.androidWidgetName.lastIndexOf('.') + 1).toLowerCase()}_1`);
        }
    }
    public setAndroidDimensions(options: any) {
        const styleMap = this.styleMap;
        let parent: Widget = null;
        let width = 0;
        let height = 0;
        let requireWrap = false;
        if (options != null) {
            parent = options.parent;
            [width, height] = [options.width, options.height];
            requireWrap = options.requireWrap;
        }
        else {
            parent = this.parent as Widget;
            width = this.element.offsetWidth + this.marginLeft + this.marginRight;
            height = this.element.offsetHeight + this.marginTop + this.marginBottom;
            requireWrap = parent.is(WIDGET_ANDROID.CONSTRAINT, WIDGET_ANDROID.GRID);
        }
        const parentWidth = (parent.id !== 0 ? parent.element.offsetWidth - (parent.paddingLeft + parent.paddingRight + convertInt(parent.style.borderLeftWidth) + convertInt(parent.style.borderRightWidth)) : Number.MAX_VALUE);
        const parentHeight = (parent.id !== 0 ? parent.element.offsetHeight - (parent.paddingTop + parent.paddingBottom + convertInt(parent.style.borderTopWidth) + convertInt(parent.style.borderBottomWidth)) : Number.MAX_VALUE);
        if (this.overflow !== OVERFLOW_CHROME.NONE && !this.is(WIDGET_ANDROID.TEXT)) {
            this.android('layout_width', (this.horizontal ? 'wrap_content' : 'match_parent'))
                .android('layout_height', (this.horizontal ? 'match_parent' : 'wrap_content'));
        }
        else {
            if (this.android('layout_width') !== '0px') {
                if (styleMap.width != null) {
                    this.android('layout_width', convertPX(styleMap.width));
                }
                if (styleMap.minWidth != null) {
                    this.android('layout_width', 'wrap_content', false)
                        .android('minWidth', convertPX(styleMap.minWidth), false);
                }
                if (styleMap.maxWidth != null) {
                    this.android('maxWidth', convertPX(styleMap.maxWidth), false);
                }
            }
            if ((!this.flex.enabled || this.constraint.expand) && this.constraint.layoutWidth != null) {
                if (this.constraint.layoutWidth) {
                    this.android('layout_width', (this.renderChildren.some((node: Widget) => node.css('float') === 'right') || convertInt(this.bounds.minWidth) >= parentWidth ? 'match_parent' : this.bounds.minWidth));
                }
                else {
                    this.android('layout_width', 'wrap_content', false);
                }
            }
            else if (this.android('layout_width') == null) {
                if (requireWrap) {
                    this.android('layout_width', 'wrap_content');
                }
                else {
                    if (FIXED_ANDROID.includes(this.widgetName)) {
                        this.android('layout_width', 'wrap_content');
                    }
                    else {
                        if (parent.overflow === OVERFLOW_CHROME.NONE && width >= parentWidth) {
                            this.android('layout_width', 'match_parent');
                        }
                        else {
                            const display = this.style && this.style.display;
                            switch (display) {
                                case 'line-item':
                                case 'block':
                                case 'inherit':
                                    this.android('layout_width', 'match_parent');
                                    break;
                                default:
                                    this.android('layout_width', 'wrap_content');
                            }
                        }
                    }
                }
            }
            if (this.android('layout_height') !== '0px') {
                if (styleMap.height != null || styleMap.lineHeight != null) {
                    this.android('layout_height', convertPX(styleMap.height || styleMap.lineHeight));
                }
                if (styleMap.minHeight != null) {
                    this.android('layout_height', 'wrap_content', false)
                        .android('minHeight', convertPX(styleMap.minHeight), false);
                }
                if (styleMap.maxHeight != null) {
                    this.android('maxHeight', convertPX(styleMap.maxHeight), false);
                }
            }
            if ((!this.flex.enabled || this.constraint.expand) && this.constraint.layoutHeight != null) {
                this.android('layout_height', (this.constraint.layoutHeight ? this.bounds.minHeight : 'wrap_content'), this.constraint.layoutHeight);
            }
            else if (this.android('layout_height') == null) {
                switch (this.widgetName) {
                    case WIDGET_ANDROID.TEXT:
                    case WIDGET_ANDROID.EDIT:
                    case WIDGET_ANDROID.SPINNER:
                    case WIDGET_ANDROID.CHECKBOX:
                    case WIDGET_ANDROID.RADIO:
                    case WIDGET_ANDROID.BUTTON:
                        this.android('layout_height', 'wrap_content');
                        break;
                    default:
                        this.android('layout_height', (!requireWrap && parent.overflow === OVERFLOW_CHROME.NONE && height >= parentHeight ? 'match_parent' : 'wrap_content'));
                }
            }
        }
    }
    public setAttributes(actions: number[] = null) {
        const widget = Resource.ACTION_ANDROID[this.widgetName];
        const element = this.element;
        const result = {};
        if (element.tagName === 'INPUT' && element.id !== '') {
            const nextElement = element.nextElementSibling;
            if (nextElement != null && nextElement.htmlFor === element.id) {
                const node = nextElement.__node;
                node.setAttributes([2, 4]);
                node.setAndroidId(WIDGET_ANDROID.TEXT);
                const attributes = node.combine();
                if (attributes.length > 0) {
                    result[4] = attributes;
                }
                this.css('marginRight', node.style.marginRight)
                    .css('paddingRight', node.style.paddingRight)
                    .label = node;
                node.hide();
            }
        }
        if (widget != null) {
            if (this.actions != null) {
                actions = this.actions;
            }
            let i = -1;
            for (const action in widget) {
                i++;
                if (result[action] != null || (actions != null && actions.length > 0 && !actions.includes(i))) {
                    continue;
                }
                if (hasValue(this[action])) {
                    result[action] = formatString(widget[action], this[action]);
                }
                else if (typeof Resource[action] === 'function') {
                    const data = Resource[action](this);
                    if (data != null) {
                        const output = [];
                        for (const j in widget[action]) {
                            if (result[j] != null) {
                                continue;
                            }
                            let value = data[j];
                            if (hasValue(value)) {
                                value = parseStyle(element, j, value);
                                if (value != null) {
                                    switch (action) {
                                        case 'setComputedStyle':
                                            if (!this.supported.apply(this, widget[action][j].split('=')[0].split(':'))) {
                                                continue;
                                            }
                                            break;
                                        case 'addResourceString':
                                            value = isNumber(value) ? value : `@string/${value}`;
                                            break;
                                    }
                                    output.push(formatString(widget[action][j], value));
                                }
                            }
                        }
                        if (output.length > 0) {
                            switch (action) {
                                case 'setComputedStyle':
                                    this.styleAttributes = output;
                                    break;
                                default:
                                    result[i] = output;
                            }
                        }
                    }
                }
            }
        }
        for (const i in result) {
            let value = result[i];
            if (hasValue(value)) {
                if (!Array.isArray(value)) {
                    value = [value];
                }
                value.forEach((attr: string) => this.attr(attr, false));
            }
        }
    }
    public setGravity() {
        const verticalAlign = this.styleMap.verticalAlign;
        let textAlign = '';
        let element = this.element;
        while (element != null && element.styleMap != null) {
            textAlign = element.styleMap.textAlign || textAlign;
            const float = (element !== this.element ? element.styleMap.float : '');
            if (float === 'left' || float === 'right' || hasValue(textAlign)) {
                break;
            }
            element = element.parentNode;
        }
        if (hasValue(verticalAlign) || hasValue(textAlign)) {
            let horizontal = '';
            let vertical = '';
            const layoutGravity = [];
            switch (textAlign) {
                case 'start':
                    horizontal = 'start';
                    break;
                case 'right':
                    horizontal = parseRTL('right');
                    break;
                case 'end':
                    horizontal = 'end';
                    break;
                case 'center':
                    horizontal = 'center_horizontal';
                    break;
            }
            switch (verticalAlign) {
                case 'top':
                    vertical = 'top';
                    break;
                case 'middle':
                    vertical = 'center_vertical';
                    break;
                case 'bottom':
                case 'text-bottom':
                    vertical = 'bottom';
                    break;
                default:
                    if (this.style.height === this.style.lineHeight || convertInt(this.style.lineHeight) === (this.box.bottom - this.box.top)) {
                        vertical = 'center_vertical';
                    }
            }
            const parentTextAlign = (this.styleMap.textAlign !== textAlign && !this.renderParent.floating && !this.floating);
            switch (this.renderParent.widgetName) {
                case WIDGET_ANDROID.RADIO_GROUP:
                case WIDGET_ANDROID.LINEAR:
                    if (parentTextAlign) {
                        this.renderParent.android('gravity', horizontal);
                    }
                    break;
                case WIDGET_ANDROID.CONSTRAINT:
                case WIDGET_ANDROID.RELATIVE:
                    const gravity = [vertical, horizontal].filter(value => value);
                    this.android('gravity', (gravity.length === 2 ? 'center' : gravity[0]));
                    horizontal = null;
                    vertical = null;
                    break;
                case WIDGET_ANDROID.GRID:
                    if (parentTextAlign && horizontal != null) {
                        layoutGravity.push(horizontal);
                    }
                    break;
            }
            if (vertical != null || layoutGravity.length > 0) {
                layoutGravity.push(vertical);
                this.android('layout_gravity', (layoutGravity.length === 2 ? 'center' : layoutGravity[0]));
            }
            if (horizontal != null) {
                this.android('gravity', horizontal);
            }
        }
    }

    get stringId() {
        return (this.androidId != null ? `@+id/${this.androidId}` : '');
    }
    get widgetName() {
        if (this.androidWidgetName != null) {
            return this.androidWidgetName;
        }
        else {
            let widgetName = MAPPING_CHROME[this.tagName];
            if (typeof widgetName === 'object') {
                widgetName = widgetName[this.element.type];
            }
            return widgetName;
        }
    }
    set label(value) {
        if (Widget.is(value)) {
            this._label = value;
            value.labelFor = this;
        }
    }
    get label() {
        return this._label;
    }
    get horizontal() {
        return (this._android != null && this._android.orientation === 'horizontal');
    }
    get anchored() {
        return (this.constraint.horizontal && this.constraint.vertical);
    }
    get horizontalBias() {
        const parent = this.renderParent;
        if (parent != null && parent.visible) {
            const left = this.linear.left - parent.box.left;
            const right = parent.box.right - this.linear.right;
            return calculateBias(left, right);
        }
        return 0.5;
    }
    get verticalBias() {
        const parent = this.renderParent;
        if (parent != null && parent.visible) {
            const top = this.linear.top - parent.box.top;
            const bottom = parent.box.bottom - this.linear.bottom;
            return calculateBias(top, bottom);
        }
        return 0.5;
    }
}
import { Constraint, LocalSettings } from './types/module';

import { AXIS_ANDROID, CONTAINER_ANDROID, ELEMENT_ANDROID, LAYOUT_ANDROID, RESERVED_JAVA } from './lib/constant';
import { API_ANDROID, DEPRECATED_ANDROID, FunctionResult } from './customizations';
import { BUILD_ANDROID, CONTAINER_NODE } from './lib/enumeration';

import { calculateBias, replaceRTL, stripId, validateString } from './lib/util';

import $NodeList = androme.lib.base.NodeList;
import $Resource = androme.lib.base.Resource;

import $dom = androme.lib.dom;
import $enum = androme.lib.enumeration;
import $util = androme.lib.util;

type T = androme.lib.base.Node;

function setLineHeight(node: T, lineHeight: number) {
    const offset = lineHeight - (node.hasHeight ? parseInt(node.convertPX(node.css('height'), false, true)) : node.bounds.height - (node.paddingTop + node.paddingBottom));
    if (offset > 0) {
        node.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, Math.floor(offset / 2) - (node.inlineVertical ? node.toInt('verticalAlign') : 0));
        node.modifyBox($enum.BOX_STANDARD.MARGIN_BOTTOM, Math.ceil(offset / 2));
    }
}

export default (Base: Constructor<T>) => {
    return class View extends Base implements androme.lib.base.Node {
        public static documentBody() {
            if (View._documentBody === undefined) {
                const body = new View(0, document.body);
                body.hide();
                body.setBounds();
                View._documentBody = body;
            }
            return View._documentBody;
        }

        public static getCustomizationValue(api: number, tagName: string, obj: string, attr: string) {
            for (const build of [API_ANDROID[api], API_ANDROID[0]]) {
                const value = $util.optionalAsString(build, `customizations.${tagName}.${obj}.${attr}`);
                if ($util.isString(value)) {
                    return value;
                }
            }
            return '';
        }

        public static getControlName(containerType: number): string {
            return CONTAINER_ANDROID[CONTAINER_NODE[containerType]];
        }

        private static _documentBody: View;

        public readonly renderChildren: View[] = [];

        public readonly constraint: Constraint = {
            horizontal: false,
            vertical: false,
            current: {}
        };

        protected _namespaces = new Set(['android', 'app']);
        protected _controlName = '';
        protected _renderParent: View | undefined;
        protected _documentParent: View | undefined;
        protected _fontSize = 0;
        protected readonly _boxAdjustment: BoxModel = $dom.newBoxModel();
        protected readonly _boxReset: BoxModel = $dom.newBoxModel();

        private _containerType = 0;

        private _localSettings: LocalSettings & ObjectMap<any> = {
            targetAPI: 0,
            resolutionDPI: 160,
            supportRTL: false
        };

        private __android: StringMap = {};
        private __app: StringMap = {};

        constructor(
            id = 0,
            element?: Element | null,
            afterInit?: SelfWrapped<View, void>)
        {
            super(id, element);
            if (afterInit) {
                afterInit(this);
            }
        }

        public attr(obj: string, attr: string, value = '', overwrite = true) {
            const result = {};
            if (!this.supported(obj, attr, result)) {
                return '';
            }
            if (Object.keys(result).length) {
                if ($util.isString(result['obj'])) {
                    obj = result['obj'];
                }
                if ($util.isString(result['attr'])) {
                    attr = result['attr'];
                }
                if ($util.isString(result['value'])) {
                    value = result['value'];
                }
                if (typeof result['overwrite'] === 'boolean') {
                    overwrite = result['overwrite'];
                }
            }
            return super.attr(obj, attr, value, overwrite);
        }

        public android(attr: string, value = '', overwrite = true) {
            this.attr('android', attr, value, overwrite);
            return this.__android[attr] || '';
        }

        public app(attr: string, value = '', overwrite = true) {
            this.attr('app', attr, value, overwrite);
            return this.__app[attr] || '';
        }

        public apply(options: {}) {
            if (typeof options === 'object') {
                const local = Object.assign({}, options);
                super.apply(local);
                for (const obj in local) {
                    this.formatted(`${obj}="${local[obj]}"`);
                }
            }
        }

        public formatted(value: string, overwrite = true) {
            const match = value.match(/^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/);
            if (match) {
                this.attr(match[1] || '_', match[2], match[3], overwrite);
            }
        }

        public anchor(position: string, documentId = '', overwrite?: boolean) {
            const renderParent = this.renderParent as View;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    if (documentId === undefined || this.constraint.current[position] === undefined || overwrite) {
                        if (documentId && overwrite === undefined) {
                            overwrite = documentId === 'parent';
                        }
                        const attr: string = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            this.app(this.localizeString(attr), documentId, overwrite);
                            if (documentId === 'parent') {
                                switch (position) {
                                    case 'left':
                                    case 'right':
                                        this.constraint.horizontal = true;
                                        break;
                                    case 'top':
                                    case 'bottom':
                                    case 'baseline':
                                        this.constraint.vertical = true;
                                        break;
                                }
                            }
                            this.constraint.current[position] = {
                                documentId,
                                horizontal: $util.indexOf(position.toLowerCase(), 'left', 'right') !== -1
                            };
                        }
                    }
                }
                else if (renderParent.layoutRelative) {
                    if (documentId && overwrite === undefined) {
                        overwrite = documentId === 'true';
                    }
                    const attr: string = LAYOUT_ANDROID[documentId === 'true' ? 'relativeParent' : 'relative'][position];
                    this.android(this.localizeString(attr), documentId, overwrite);
                }
            }
        }

        public anchorParent(orientation: string, overwrite = false, constraintBias = false) {
            const renderParent = this.renderParent as View;
            if (renderParent) {
                const horizontal = orientation === AXIS_ANDROID.HORIZONTAL;
                if (renderParent.layoutConstraint) {
                    if (overwrite || !this.constraint[orientation]) {
                        this.anchor(horizontal ? 'left' : 'top', 'parent');
                        this.anchor(horizontal ? 'right' : 'bottom', 'parent');
                        this.constraint[orientation] = true;
                        if (constraintBias) {
                            this.app(`layout_constraint${$util.capitalize(orientation)}_bias`, this[`${orientation}Bias`]);
                        }
                    }
                }
                else if (renderParent.layoutRelative) {
                    this.anchor(horizontal ? 'left' : 'top', 'true');
                    this.anchor(horizontal ? 'right' : 'bottom', 'true');
                }
            }
        }

        public anchorDelete(...position: string[]) {
            const renderParent = this.renderParent as View;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    this.delete('app', ...position.map(value => this.localizeString(LAYOUT_ANDROID.constraint[value])));
                }
                else if (renderParent.layoutRelative) {
                    for (const value of position) {
                        if (this.alignSibling(value)) {
                            this.delete('android', LAYOUT_ANDROID.relative[value], this.localizeString(LAYOUT_ANDROID.relative[value]));
                        }
                        else if (LAYOUT_ANDROID.relativeParent[value]) {
                            this.delete('android', this.localizeString(LAYOUT_ANDROID.relativeParent[value]));
                        }
                    }
                }
            }
        }

        public alignParent(position: string) {
            const renderParent = this.renderParent as View;
            if (renderParent) {
                if (renderParent.layoutConstraint) {
                    const attr: string = LAYOUT_ANDROID.constraint[position];
                    if (attr) {
                        return this.app(this.localizeString(attr)) === 'parent' || this.app(attr) === 'parent';
                    }
                }
                else if (renderParent.layoutRelative) {
                    const attr: string = LAYOUT_ANDROID.relativeParent[position];
                    if (attr) {
                        return this.android(this.localizeString(attr)) === 'true' || this.android(attr) === 'true';
                    }
                }
            }
            return false;
        }

        public alignSibling(position: string) {
            if (this.rendered) {
                const renderParent = this.renderParent as View;
                if (renderParent.is(CONTAINER_NODE.CONSTRAINT)) {
                    const attr: string = LAYOUT_ANDROID.constraint[position];
                    const value = this.app(this.localizeString(attr)) || this.app(attr);
                    return value !== 'parent' && value !== renderParent.documentId ? value : '';
                }
                else if (renderParent.is(CONTAINER_NODE.RELATIVE)) {
                    const attr = LAYOUT_ANDROID.relative[position];
                    return this.android(this.localizeString(attr)) || this.android(attr);
                }
            }
            return '';
        }

        public horizontalBias() {
            const parent = this.documentParent;
            if (parent !== this) {
                const left = Math.max(0, this.linear.left - parent.box.left);
                const right = Math.max(0, parent.box.right - this.linear.right);
                return calculateBias(left, right, this.localSettings.constraintPercentAccuracy);
            }
            return 0.5;
        }

        public verticalBias() {
            const parent = this.documentParent;
            if (parent !== this) {
                const top = Math.max(0, this.linear.top - parent.box.top);
                const bottom = Math.max(0, parent.box.bottom - this.linear.bottom);
                return calculateBias(top, bottom, this.localSettings.constraintPercentAccuracy);
            }
            return 0.5;
        }

        public supported(obj: string, attr: string, result = {}): boolean {
            if (this.localSettings.targetAPI > 0 && this.localSettings.targetAPI < BUILD_ANDROID.LATEST) {
                const deprecated: ObjectMap<FunctionResult> = DEPRECATED_ANDROID[obj];
                if (deprecated && typeof deprecated[attr] === 'function') {
                    const valid = deprecated[attr](result, this.localSettings.targetAPI, this);
                    if (!valid || Object.keys(result).length) {
                        return valid;
                    }
                }
                for (let i = this.localSettings.targetAPI; i <= BUILD_ANDROID.LATEST; i++) {
                    const version = API_ANDROID[i];
                    if (version && version[obj] && version[obj][attr] !== undefined) {
                        const callback: FunctionResult | boolean = version[obj][attr];
                        if (typeof callback === 'boolean') {
                            return callback;
                        }
                        else if (typeof callback === 'function') {
                            return callback(result, this.localSettings.targetAPI, this);
                        }
                    }
                }
            }
            return true;
        }

        public combine(...objs: string[]) {
            const result: string[] = [];
            for (const value of this._namespaces.values()) {
                const obj: StringMap = this[`__${value}`];
                if (objs.length === 0 || objs.includes(value)) {
                    for (const attr in obj) {
                        if (value !== '_') {
                            result.push(`${value}:${attr}="${obj[attr]}"`);
                        }
                        else {
                            result.push(`${attr}="${obj[attr]}"`);
                        }
                    }
                }
            }
            return result.sort((a, b) => {
                if (a.startsWith('android:id=')) {
                    return -1;
                }
                else if (b.startsWith('android:id=')) {
                    return 1;
                }
                else {
                    return a > b ? 1 : -1;
                }
            });
        }

        public localizeString(value: string) {
            if (!this.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.LOCALIZATION)) {
                return replaceRTL(value, this.localSettings.supportRTL, this.localSettings.targetAPI);
            }
            return value;
        }

        public clone(id?: number, children = false): View {
            const node = new View(id || this.id, this.baseElement);
            Object.assign(node.localSettings, this.localSettings);
            node.containerType = this.containerType;
            node.alignmentType = this.alignmentType;
            node.controlId = this.controlId;
            node.controlName = this.controlName;
            node.depth = this.depth;
            node.visible = this.visible;
            node.rendered = this.rendered;
            node.renderDepth = this.renderDepth;
            node.renderParent = this.renderParent;
            node.renderExtension = this.renderExtension;
            node.documentParent = this.documentParent;
            node.documentRoot = this.documentRoot;
            if (children) {
                node.retain(this.duplicate());
            }
            node.inherit(this, 'initial', 'base', 'style', 'styleMap');
            return node;
        }

        public setControlType(controlName: string, containerType?: number) {
            if (containerType) {
                this.containerType = containerType;
            }
            else if (this.containerType === 0) {
                for (const global in CONTAINER_ANDROID) {
                    if (CONTAINER_ANDROID[global] === controlName) {
                        for (const local in CONTAINER_NODE) {
                            if (CONTAINER_NODE[CONTAINER_NODE[local]] === global) {
                                this.containerType = <unknown> CONTAINER_NODE[local] as number;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            this.controlName = controlName;
            if (this.android('id') !== '') {
                this.controlId = stripId(this.android('id'));
            }
            if (this.controlId === '') {
                const element = this.baseElement;
                let name = '';
                if (element) {
                    name = validateString(element.id || (<HTMLInputElement> element).name);
                    if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                        name = `_${name}`;
                    }
                }
                this.controlId = $util.convertWord($Resource.generateId('android', name || $util.lastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
                this.android('id', this.documentId);
            }
        }

        public setLayout() {
            const parent = this.absoluteParent;
            const children = this.renderChildren;
            const renderParent = this.renderParent;
            if (this.documentBody) {
                if (!this.hasWidth && children.some(node => node.alignParent('right'))) {
                    this.android('layout_width', 'match_parent', false);
                }
                if (!this.hasHeight && children.some(node => node.alignParent('bottom'))) {
                    this.android('layout_height', 'match_parent', false);
                }
            }
            let hasWidth = false;
            if (!this.android('layout_width')) {
                if (!this.inlineStatic && this.has('width') || this.toInt('width') > 0 && !this.cssInitial('width')) {
                    const width = this.css('width');
                    if ($util.isUnit(width)) {
                        const widthParent = renderParent ? $util.convertInt((renderParent as View).android('layout_width')) : 0;
                        const value = this.convertPX(width);
                        if (parent === renderParent && widthParent > 0 && $util.convertInt(value) >= widthParent) {
                            this.android('layout_width', 'match_parent');
                        }
                        else {
                            this.android('layout_width', value);
                        }
                        hasWidth = true;
                    }
                    else if ($util.isPercent(width)) {
                        if (width === '100%') {
                            this.android('layout_width', 'match_parent');
                        }
                        else {
                            this.android('layout_width', this.convertPercent(width, true));
                        }
                        hasWidth = true;
                    }
                }
            }
            if (this.has('minWidth') && !this.constraint.minWidth) {
                const value = this.convertPX(this.css('minWidth'));
                this.android('layout_width', 'wrap_content', false);
                this.android('minWidth', value, false);
                hasWidth = true;
            }
            if (this.has('maxWidth')) {
                const value = this.convertPX(this.css('maxWidth'));
                if (this.textElement) {
                    this.android('maxWidth', value, false);
                    this.android('layout_width', 'wrap_content', false);
                    hasWidth = true;
                }
                else if (this.layoutVertical && !this.documentBody) {
                    children.forEach(node => node.textElement && !node.has('maxWidth') && node.android('maxWidth', value, false));
                }
            }
            if (!hasWidth) {
                if (this.plainText) {
                    this.android('layout_width', renderParent && this.bounds.width > renderParent.box.width && this.multiLine && this.alignParent('left') ? 'match_parent' : 'wrap_content', false);
                }
                else if (children.filter(node => (node.inlineStatic || $util.isUnit(node.cssInitial('width'))) && !node.autoMargin.horizontal).some(node => Math.ceil(node.bounds.width) >= this.box.width)) {
                    this.android('layout_width', 'wrap_content', false);
                }
                else if (
                    !this.documentRoot && children.some(node => node.layoutVertical && !node.hasWidth && !node.floating && !node.autoMargin.horizontal) ||
                    this.layoutFrame && (
                        $NodeList.floated(children).size === 2 ||
                        children.some(node => node.blockStatic && (node.autoMargin.leftRight || node.rightAligned))
                   ))
                {
                    this.android('layout_width', 'match_parent', false);
                }
                else {
                    const wrap = (
                        this.containerType < CONTAINER_NODE.INLINE ||
                        !this.pageFlow ||
                        this.inlineFlow ||
                        this.tableElement ||
                        this.flexElement ||
                        parent.flexElement ||
                        parent.gridElement ||
                        !!renderParent && renderParent.is(CONTAINER_NODE.GRID)
                    );
                    if ((!wrap || this.blockStatic && !this.has('maxWidth')) && (
                            this.linear.width >= parent.box.width ||
                            this.layoutVertical && !this.autoMargin.horizontal ||
                            this.htmlElement && this.blockStatic && (parent.documentBody || parent.blockStatic && (this.singleChild || this.alignedVertically(this.previousSiblings()))) ||
                            this.groupParent && children.some(item => !(item.plainText && item.multiLine) && item.linear.width >= this.documentParent.box.width)
                        ))
                    {
                        this.android('layout_width', 'match_parent', false);
                    }
                    else {
                        this.android('layout_width', 'wrap_content', false);
                    }
                }
            }
            let hasHeight = false;
            if (!this.android('layout_height')) {
                if (!this.inlineStatic && this.has('height') || this.toInt('height') > 0 && !this.cssInitial('height')) {
                    const height = this.css('height');
                    if ($util.isUnit(height)) {
                        const value = this.convertPX(height, false);
                        this.android('layout_height', this.css('overflow') === 'hidden' && parseInt(value) < Math.floor(this.box.height) ? 'wrap_content' : value);
                        hasHeight = true;
                    }
                    else if ($util.isPercent(height)) {
                        if (height === '100%') {
                            this.android('layout_height', 'match_parent');
                        }
                        else {
                            this.android('layout_height', $util.formatPX(Math.ceil(this.bounds.height) - this.contentBoxHeight));
                        }
                        hasHeight = true;
                    }
                }
            }
            if (this.has('minHeight') && !this.constraint.minHeight) {
                const value = this.convertPX(this.css('minHeight'), false);
                this.android('layout_height', 'wrap_content', false);
                this.android('minHeight', value, false);
                hasHeight = true;
            }
            if (this.has('maxHeight')) {
                const value = this.convertPX(this.css('maxHeight'), false);
                if (this.textElement) {
                    this.android('maxHeight', value, false);
                    this.android('layout_height', 'wrap_content', false);
                    hasHeight = true;
                }
                else if (this.layoutVertical && !this.documentBody) {
                    children.forEach(node => node.textElement && !node.has('maxHeight') && node.android('maxHeight', value, false));
                }
            }
            if (!hasHeight) {
                this.android('layout_height', 'wrap_content', false);
            }
        }

        public setAlignment() {
            const renderParent = this.renderParent as View;
            if (renderParent) {
                const left = this.localizeString('left');
                const right = this.localizeString('right');
                function setAutoMargin(node: View) {
                    if (!node.blockWidth) {
                        const alignment: string[] = [];
                        if (node.autoMargin.leftRight) {
                            alignment.push('center_horizontal');
                        }
                        else if (node.autoMargin.left) {
                            alignment.push(right);
                        }
                        else if (node.autoMargin.right) {
                            alignment.push(left);
                        }
                        if (node.autoMargin.topBottom) {
                            alignment.push('center_vertical');
                        }
                        else if (node.autoMargin.top) {
                            alignment.push('bottom');
                        }
                        else if (node.autoMargin.bottom) {
                            alignment.push('top');
                        }
                        if (alignment.length) {
                            node.mergeGravity(node.blockWidth ? 'gravity' : 'layout_gravity', ...alignment);
                            return true;
                        }
                    }
                    return false;
                }
                function convertHorizontal(value: string) {
                    switch (value) {
                        case 'left':
                        case 'start':
                            return left;
                        case 'right':
                        case 'end':
                            return right;
                        case 'center':
                            return 'center_horizontal';
                        default:
                            return '';
                    }
                }
                function setTextAlign(value: string) {
                    if (textAlign === '' || value === right) {
                        return value;
                    }
                    return textAlign;
                }
                let textAlign = this.cssInitial('textAlign', true) || '';
                let verticalAlign = '';
                if (this.pageFlow) {
                    const children = this.renderChildren;
                    let floating = '';
                    if (this.inlineVertical && renderParent.is(CONTAINER_NODE.LINEAR, CONTAINER_NODE.GRID)) {
                        switch (this.cssInitial('verticalAlign', true)) {
                            case 'top':
                                verticalAlign = 'top';
                                break;
                            case 'middle':
                                verticalAlign = 'center_vertical';
                                break;
                            case 'bottom':
                                verticalAlign = 'bottom';
                                break;
                        }
                    }
                    if (!this.blockWidth && (renderParent.layoutVertical || (this.documentRoot && this.layoutVertical))) {
                        if (this.floating) {
                            this.mergeGravity('layout_gravity', this.float === 'right' ? right : left);
                        }
                        else {
                            setAutoMargin(this);
                        }
                    }
                    if (this.hasAlign($enum.NODE_ALIGNMENT.FLOAT)) {
                        if (this.hasAlign($enum.NODE_ALIGNMENT.RIGHT) || children.length && children.every(node => node.rightAligned)) {
                            floating = right;
                        }
                        else if (this.groupParent && !children.some(item => item.float === 'right')) {
                            floating = left;
                        }
                    }
                    if (renderParent.layoutFrame) {
                        if (!setAutoMargin(this)) {
                            floating = this.floating ? this.float : floating;
                            if (floating !== '' && floating !== 'none') {
                                if (renderParent.inlineWidth || this.singleChild && !renderParent.documentRoot) {
                                    renderParent.mergeGravity('layout_gravity', floating);
                                }
                                else {
                                    if (this.blockWidth) {
                                        textAlign = setTextAlign(floating);
                                    }
                                    else {
                                        this.mergeGravity('layout_gravity', floating);
                                    }
                                }
                            }
                        }
                    }
                    else if (floating !== '') {
                        if (this.blockWidth) {
                            textAlign = setTextAlign(floating);
                        }
                        else {
                            this.mergeGravity('layout_gravity', floating);
                        }
                    }
                }
                const textAlignParent = this.cssParent('textAlign');
                if (textAlignParent !== '' && this.localizeString(textAlignParent) !== left) {
                    if (renderParent.layoutFrame && this.pageFlow && !this.floating && !this.autoMargin.horizontal && !this.blockWidth) {
                        this.mergeGravity('layout_gravity', convertHorizontal(textAlignParent));
                    }
                    if (!this.imageElement && textAlign === '') {
                        textAlign = textAlignParent;
                    }
                }
                if (verticalAlign !== '' && renderParent.layoutLinear && renderParent.layoutHorizontal) {
                    this.mergeGravity('layout_gravity', verticalAlign);
                    verticalAlign = '';
                }
                if (this.documentRoot && (this.blockWidth || this.layoutFrame)) {
                    this.delete('android', 'layout_gravity');
                }
                if (!this.layoutConstraint) {
                    this.mergeGravity('gravity', convertHorizontal(textAlign), verticalAlign);
                }
            }
        }

        public mergeGravity(attr: string, ...alignment: string[]) {
            const direction = new Set([...this.android(attr).split('|'), ...alignment].filter(value => value.trim() !== '').map(value => this.localizeString(value)));
            let result = '';
            switch (direction.size) {
                case 0:
                    break;
                case 1:
                    result = direction.values().next().value;
                default:
                    let x = '';
                    let y = '';
                    let z = '';
                    ['center', 'fill'].forEach(value => {
                        const horizontal = `${value}_horizontal`;
                        const vertical = `${value}_vertical`;
                        if (direction.has(horizontal) && direction.has(vertical)) {
                            direction.delete(horizontal);
                            direction.delete(vertical);
                            direction.add(value);
                        }
                    });
                    for (const value of direction.values()) {
                        switch (value) {
                            case 'left':
                            case 'start':
                            case 'right':
                            case 'end':
                            case 'center_horizontal':
                                x = value;
                                break;
                            case 'top':
                            case 'bottom':
                            case 'center_vertical':
                                y = value;
                                break;
                            default:
                                z += (z !== '' ? '|' : '') + value;
                                break;
                        }
                    }
                    const gravity = [x, y].filter(value => value).join('|');
                    result = gravity + (z !== '' ? (gravity !== '' ? '|' : '') + z : '');
            }
            if (result !== '') {
                return this.android(attr, result);
            }
            else {
                this.delete('android', attr);
                return '';
            }
        }

        public applyOptimizations() {
            if (this.renderParent) {
                this.autoSizeBoxModel();
                this.alignHorizontalLayout();
                this.alignVerticalLayout();
            }
            this.setBoxSpacing();
            switch (this.cssParent('visibility', true)) {
                case 'hidden':
                case 'collapse':
                    this.android('visibility', 'invisible');
                    break;
            }
        }

        public applyCustomizations() {
            for (const build of [API_ANDROID[0], API_ANDROID[this.localSettings.targetAPI]]) {
                if (build && build.customizations) {
                    for (const tagName of [this.tagName, this.controlName]) {
                        const customizations = build.customizations[tagName];
                        if (customizations) {
                            for (const obj in customizations) {
                                for (const attr in customizations[obj]) {
                                    this.attr(obj, attr, customizations[obj][attr], this.localSettings.customizationsOverwritePrivilege);
                                }
                            }
                        }
                    }
                }
            }
        }

        private autoSizeBoxModel() {
            if (this.localSettings.autoSizePaddingAndBorderWidth && !this.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.AUTOFIT)) {
                const renderParent = this.renderParent as View;
                let layoutWidth = $util.convertInt(this.android('layout_width'));
                let layoutHeight = $util.convertInt(this.android('layout_height'));
                let borderWidth = false;
                if (this.imageElement) {
                    const top = this.borderTopWidth;
                    const right = this.borderRightWidth;
                    const bottom = this.borderBottomWidth;
                    const left = this.borderLeftWidth;
                    let width = 0;
                    let height = 0;
                    if (top > 0) {
                        this.modifyBox($enum.BOX_STANDARD.PADDING_TOP, top);
                        height += top;
                    }
                    if (right > 0) {
                        this.modifyBox($enum.BOX_STANDARD.PADDING_RIGHT, right);
                        width += right;
                    }
                    if (bottom > 0) {
                        this.modifyBox($enum.BOX_STANDARD.PADDING_BOTTOM, bottom);
                        height += bottom;
                    }
                    if (left > 0) {
                        this.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, left);
                        width += left;
                    }
                    height += this.paddingTop + this.paddingBottom;
                    width += this.paddingLeft + this.paddingRight;
                    if (width > 0) {
                        if (layoutWidth > 0) {
                            this.android('layout_width', $util.formatPX(layoutWidth + width));
                        }
                        else {
                            layoutWidth = $util.convertInt(renderParent.android('layout_width'));
                            if (layoutWidth > 0 && this.singleChild) {
                                renderParent.android('layout_width', $util.formatPX(layoutWidth + this.marginLeft + width));
                            }
                        }
                    }
                    if (height > 0) {
                        if (layoutHeight > 0) {
                            this.android('layout_height', $util.formatPX(layoutHeight + height));
                        }
                        else {
                            layoutHeight = $util.convertInt(renderParent.android('layout_height'));
                            if (layoutHeight > 0 && this.singleChild) {
                                renderParent.android('layout_height', $util.formatPX(layoutHeight + this.marginTop + height));
                            }
                        }
                    }
                }
                else if (this.is(CONTAINER_NODE.BUTTON) && layoutHeight === 0) {
                    if (!this.has('minHeight')) {
                        this.android('layout_height', $util.formatPX(this.bounds.height + (this.css('borderStyle') === 'outset' ? $util.convertInt(this.css('borderWidth')) : 0)));
                    }
                }
                else if (this.is(CONTAINER_NODE.LINE)) {
                    if (layoutHeight > 0 && this.cssInitial('height') && this.tagName !== 'HR') {
                        this.android('layout_height', $util.formatPX(layoutHeight + this.borderTopWidth + this.borderBottomWidth));
                    }
                }
                else if (this.tableElement) {
                    borderWidth = this.css('boxSizing') === 'content-box' || $dom.isUserAgent($enum.USER_AGENT.EDGE | $enum.USER_AGENT.FIREFOX);
                }
                else if (this.styleElement && !this.hasBit('excludeResource', $enum.NODE_RESOURCE.BOX_SPACING)) {
                    if (!renderParent.tableElement && this.css('boxSizing') !== 'border-box') {
                        const paddedWidth = this.contentBoxWidth;
                        const paddedHeight = this.contentBoxHeight;
                        if (layoutWidth > 0 && paddedWidth > 0 && this.toInt('width', true) > 0) {
                            this.android('layout_width', $util.formatPX(layoutWidth + paddedWidth));
                        }
                        if (layoutHeight > 0 && paddedHeight > 0 && this.toInt('height', true) > 0) {
                            this.android('layout_height', $util.formatPX(layoutHeight + paddedHeight));
                        }
                    }
                    borderWidth = true;
                }
                if (borderWidth && this.visibleStyle.borderWidth) {
                    this.modifyBox($enum.BOX_STANDARD.PADDING_TOP, this.borderTopWidth);
                    this.modifyBox($enum.BOX_STANDARD.PADDING_RIGHT, this.borderRightWidth);
                    this.modifyBox($enum.BOX_STANDARD.PADDING_BOTTOM, this.borderBottomWidth);
                    this.modifyBox($enum.BOX_STANDARD.PADDING_LEFT, this.borderLeftWidth);
                }
            }
        }

        private alignHorizontalLayout() {
            if (this.layoutLinear && this.layoutHorizontal) {
                const children = this.renderChildren;
                let baseline: View | undefined;
                if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                    this.android('baselineAligned', 'false');
                }
                else {
                    baseline = $NodeList.baseline(children.filter(node => node.baseline && !node.layoutRelative && !node.layoutConstraint), true )[0];
                    if (baseline) {
                        this.android('baselineAlignedChildIndex', children.indexOf(baseline).toString());
                    }
                }
                const lineHeight = Math.max(this.lineHeight, $util.maxArray(this.renderChildren.map(node => node.lineHeight)));
                if (lineHeight > 0) {
                    setLineHeight(this, lineHeight);
                }
            }
        }

        private alignVerticalLayout() {
            const renderParent = this.renderParent;
            if (renderParent && !renderParent.layoutHorizontal) {
                const lineHeight = this.lineHeight;
                if (lineHeight) {
                    const setMinHeight = () => {
                        const minHeight = this.css('minHeight');
                        if ($util.isUnit(minHeight) && parseInt(minHeight) < lineHeight) {
                            this.android('minHeight', $util.formatPX(lineHeight));
                            this.mergeGravity('gravity', 'center_vertical');
                        }
                    };
                    if (this.length === 0) {
                        if (!this.layoutHorizontal) {
                            if (this.inlineStatic && this.visibleStyle.background) {
                                setLineHeight(this, lineHeight);
                            }
                            else {
                                setMinHeight();
                            }
                        }
                    }
                    else if (this.layoutVertical) {
                        this.each((node: View) => !node.layoutHorizontal && setLineHeight(node, lineHeight), true);
                    }
                }
            }
        }

        private setBoxSpacing() {
            if (!this.hasBit('excludeResource', $enum.NODE_RESOURCE.BOX_SPACING)) {
                const stored: StringMap = this.data($Resource.KEY_NAME, 'boxSpacing');
                if (stored) {
                    if (stored.marginLeft === stored.marginRight && !this.blockWidth && this.alignParent('left') && this.alignParent('right')) {
                        this.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                        this.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, null);
                    }
                    if (this.css('marginLeft') === 'auto') {
                        this.modifyBox($enum.BOX_STANDARD.MARGIN_LEFT, null);
                    }
                    if (this.css('marginRight') === 'auto') {
                        this.modifyBox($enum.BOX_STANDARD.MARGIN_RIGHT, null);
                    }
                }
                const boxModel: BoxMargin & BoxPadding = {
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                    paddingLeft: 0
                };
                ['margin', 'padding'].forEach((region, index) => {
                    ['Top', 'Left', 'Right', 'Bottom'].forEach(direction => {
                        const dimension = region + direction;
                        let value = 0;
                        if (!(dimension === 'marginRight' && this.inline && this.bounds.right >= this.documentParent.box.right)) {
                            value += this._boxReset[dimension] === 0 ? this[dimension] : 0;
                        }
                        value += this._boxAdjustment[dimension];
                        boxModel[region + direction] = value;
                    });
                    const prefix = index === 0 ? 'layout_margin' : 'padding';
                    const top = `${region}Top`;
                    const right = `${region}Right`;
                    const bottom = `${region}Bottom`;
                    const left = `${region}Left`;
                    const localizeLeft = this.localizeString('Left');
                    const localizeRight = this.localizeString('Right');
                    const renderParent = this.renderParent;
                    let mergeAll: number | undefined;
                    let mergeHorizontal: number | undefined;
                    let mergeVertical: number | undefined;
                    if (this.supported('android', 'layout_marginHorizontal') && !(index === 0 && renderParent && renderParent.is(CONTAINER_NODE.GRID))) {
                        if (boxModel[top] === boxModel[right] && boxModel[right] === boxModel[bottom] && boxModel[bottom] === boxModel[left]) {
                            mergeAll = boxModel[top];
                        }
                        else {
                            if (boxModel[left] === boxModel[right]) {
                                mergeHorizontal = boxModel[left];
                            }
                            if (boxModel[top] === boxModel[bottom]) {
                                mergeVertical = boxModel[top];
                            }
                        }
                    }
                    if (mergeAll !== undefined) {
                        if (mergeAll !== 0) {
                            this.android(prefix, $util.formatPX(mergeAll));
                        }
                    }
                    else {
                        if (mergeHorizontal !== undefined) {
                            if (mergeHorizontal !== 0) {
                                this.android(`${prefix}Horizontal`, $util.formatPX(mergeHorizontal));
                            }
                        }
                        else {
                            if (boxModel[left] !== 0) {
                                this.android(prefix + localizeLeft, $util.formatPX(boxModel[left]));
                            }
                            if (boxModel[right] !== 0) {
                                this.android(prefix + localizeRight, $util.formatPX(boxModel[right]));
                            }
                        }
                        if (mergeVertical !== undefined) {
                            if (mergeVertical !== 0) {
                                this.android(`${prefix}Vertical`, $util.formatPX(mergeVertical));
                            }
                        }
                        else {
                            if (boxModel[top] !== 0) {
                                this.android(`${prefix}Top`, $util.formatPX(boxModel[top]));
                            }
                            if (boxModel[bottom] !== 0) {
                                this.android(`${prefix}Bottom`, $util.formatPX(boxModel[bottom]));
                            }
                        }
                    }
                });
            }
        }

        get documentId() {
            return this.controlId ? `@+id/${this.controlId}` : '';
        }

        set anchored(value) {
            this.constraint.horizontal = value;
            this.constraint.vertical = value;
        }
        get anchored() {
            return this.constraint.horizontal && this.constraint.vertical;
        }

        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            if (this._containerType === 0) {
                const value = ELEMENT_ANDROID[this.tagName] || 0;
                if (value !== 0) {
                    this._containerType = value;
                }
            }
            return this._containerType || 0;
        }

        get layoutFrame() {
            return this.is(CONTAINER_NODE.FRAME);
        }
        get layoutLinear() {
            return this.is(CONTAINER_NODE.LINEAR);
        }
        get layoutRelative() {
            return this.is(CONTAINER_NODE.RELATIVE);
        }
        get layoutConstraint() {
            return this.is(CONTAINER_NODE.CONSTRAINT);
        }

        get support() {
            return {
                container: {
                    positionRelative: this.layoutRelative || this.layoutConstraint
                }
            };
        }

        get inlineWidth() {
            return this.android('layout_width') === 'wrap_content';
        }
        get inlineHeight() {
            return this.android('layout_height') === 'wrap_content';
        }

        get blockWidth() {
            return this.android('layout_width') === 'match_parent';
        }
        get blockHeight() {
            return this.android('layout_height') === 'match_parent';
        }

        get absoluteParent() {
            return super.absoluteParent || $dom.getElementAsNode(document.body) || super.documentParent;
        }

        get singleChild() {
            return this.renderParent ? this.renderParent.length === 1 : this.parent ? this.parent.length === 1 : false;
        }

        get dpi() {
            return this.localSettings.resolutionDPI;
        }

        get fontSize() {
            if (this._fontSize === 0) {
                this._fontSize = parseInt($util.convertPX(this.css('fontSize'), this.dpi, 0)) || 16;
            }
            return this._fontSize;
        }

        set localSettings(value) {
            Object.assign(this._localSettings, value);
        }
        get localSettings() {
            return this._localSettings;
        }
    };
};
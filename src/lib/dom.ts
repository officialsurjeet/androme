import { BoxModel, ClientRect, Null } from './types';
import Node from '../base/node';
import { convertInt, optional, hasValue } from './util';

export function getNode(element: HTMLElement): Null<Node> {
    return (element != null ? <Node> (<any> element).__node : null);
}

export function previousNode(element: HTMLElement) {
    let previous: Null<HTMLElement>;
    do {
        previous = (<HTMLElement> element.previousSibling);
        if (previous != null && getNode(previous) != null) {
            return getNode(previous);
        }
    }
    while (previous != null);
    return null;
}

export function getRangeBounds(element: HTMLElement): [ClientRect, boolean] {
    let multiLine = false;
    const range = document.createRange();
    range.selectNodeContents(element);
    const domRect = Array.from(range.getClientRects());
    const result = (<ClientRect> JSON.parse(JSON.stringify(domRect[0])));
    const top = new Set([result.top]);
    const bottom = new Set([result.bottom]);
    for (let i = 1 ; i < domRect.length; i++) {
        const rect = domRect[i];
        top.add(rect.top);
        bottom.add(rect.bottom);
        result.width += rect.width;
        result.right = Math.max(rect.right, result.right);
    }
    if (top.size > 1 && bottom.size > 1) {
        result.top = Math.min.apply(null, Array.from(top));
        result.bottom = Math.max.apply(null, Array.from(bottom));
        result.height = result.bottom - result.top;
        multiLine = true;
    }
    return [assignBounds(<ClientRect> result), multiLine];
}

export function assignBounds(bounds: ClientRect): ClientRect {
    return {
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height
    };
}

export function getStyle(element: Null<HTMLElement>, cache = true): CSSStyleDeclaration {
    if (element != null) {
        const object: any = element;
        if (cache) {
            if (object.__style != null) {
                return object.__style;
            }
            else if (object.__node != null && object.__node.style != null) {
                return object.__node.style;
            }
        }
        if (element.nodeName !== '#text') {
            const style = getComputedStyle(element);
            object.__style = style;
            return style;
        }
    }
    return (<CSSStyleDeclaration> {});
}

export function sameAsParent(element: HTMLElement, attr: string) {
    if (element.parentElement != null) {
        const style = getStyle(element);
        return (style && style[attr] === getStyle(element.parentElement)[attr]);
    }
    return false;
}

export function getBoxSpacing(element: HTMLElement, complete = false) {
    const result: BoxModel = {};
    const style = getStyle(element);
    const node = getNode(element);
    ['padding', 'margin'].forEach(border => {
        ['Top', 'Left', 'Right', 'Bottom'].forEach(direction => {
            const attr = border + direction;
            const value = convertInt(node != null ? node[attr] : style[attr]);
            if (complete || value !== 0) {
                result[attr] = value;
            }
        });
    });
    return result;
}

export function hasFreeFormText(element: HTMLElement, maxDepth = 0) {
    let valid = false;
    let depth = 0;
    function findFreeForm(elements: any[]) {
        return elements.some((item: HTMLElement) => {
            if (item.nodeName === '#text' && optional(item, 'textContent').trim() !== '') {
                valid = true;
                return true;
            }
            else if (item.childNodes && item.childNodes.length > 0) {
                depth++;
                return findFreeForm(Array.from(item.childNodes));
            }
            if (depth === maxDepth) {
                return true;
            }
            return false;
        });
    }
    findFreeForm(Array.from(element.childNodes));
    return valid;
}

export function isVisible(element: HTMLElement) {
    switch (element.tagName) {
        case 'BR':
        case 'OPTION':
        case 'AREA':
            return false;
    }
    if (typeof element.getBoundingClientRect === 'function') {
        const bounds = element.getBoundingClientRect();
        if (bounds.width !== 0 && bounds.height !== 0 || hasValue(element.dataset.ext)) {
            return true;
        }
        else {
            let current = (<HTMLElement> element.parentElement);
            let valid = true;
            while (current != null) {
                if (getStyle(current).display === 'none') {
                    valid = false;
                    break;
                }
                current = (<HTMLElement> current.parentElement);
            }
            if (valid && element.children.length > 0) {
                return Array.from(element.children).some((item: HTMLElement) => {
                    const style = getStyle(item);
                    const float = style.cssFloat;
                    const position = style.position;
                    return ((position !== 'static' && position !== 'initial') || float === 'left' || float === 'right');
                });
            }
        }
    }
    return false;
}
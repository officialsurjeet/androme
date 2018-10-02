import { FunctionMap, Image, Null, ObjectMap } from './lib/types';
import Application from './base/application';
import Node from './base/node';
import Extension from './base/extension';
import { convertCamelCase, convertPX, convertWord, hasValue, isPercent, isString, optional } from './lib/util';
import { getElementCache, getStyle, parseBackgroundUrl, setElementCache } from './lib/dom';
import { formatRGB, getByColorName } from './lib/color';

import android from './android/main';

type T = Node;

let main: Application<T>;
let settings: ObjectMap<any>;
let system: FunctionMap;
let framework = '';

const cacheRoot: Set<HTMLElement> = new Set();
const cacheImage: Map<string, Image> = new Map();

function setStyleMap() {
    let warning = false;
    for (let i = 0; i < document.styleSheets.length; i++) {
        const styleSheet = <CSSStyleSheet> document.styleSheets[i];
        if (styleSheet.cssRules) {
            for (let j = 0; j < styleSheet.cssRules.length; j++) {
                try {
                    const cssRule = <CSSStyleRule> styleSheet.cssRules[j];
                    const attrs: Set<string> = new Set();
                    for (const attr of Array.from(cssRule.style)) {
                        attrs.add(convertCamelCase(attr));
                    }
                    Array.from(document.querySelectorAll(cssRule.selectorText))
                        .forEach((element: HTMLElement) => {
                            for (const attr of Array.from(element.style)) {
                                attrs.add(convertCamelCase(attr));
                            }
                            const style = getStyle(element);
                            const styleMap = {};
                            for (const attr of attrs) {
                                if (attr.toLowerCase().indexOf('color') !== -1) {
                                    const color = getByColorName(cssRule.style[attr]);
                                    if (color !== '') {
                                        cssRule.style[attr] = formatRGB(color);
                                    }
                                }
                                const cssStyle = cssRule.style[attr];
                                if (element.style[attr]) {
                                    styleMap[attr] = element.style[attr];
                                }
                                else if (style[attr] === cssStyle) {
                                    styleMap[attr] = style[attr];
                                }
                                else if (cssStyle) {
                                    switch (attr) {
                                        case 'fontSize':
                                            styleMap[attr] = style[attr];
                                            break;
                                        case 'width':
                                        case 'height':
                                        case 'lineHeight':
                                        case 'verticalAlign':
                                        case 'columnGap':
                                        case 'top':
                                        case 'right':
                                        case 'bottom':
                                        case 'left':
                                        case 'marginTop':
                                        case 'marginRight':
                                        case 'marginBottom':
                                        case 'marginLeft':
                                        case 'paddingTop':
                                        case 'paddingRight':
                                        case 'paddingBottom':
                                        case 'paddingLeft':
                                            styleMap[attr] = /^[A-Za-z\-]+$/.test(cssStyle as string) || isPercent(cssStyle) ? cssStyle : convertPX(cssStyle, style.fontSize as string);
                                            break;
                                        default:
                                            if (styleMap[attr] == null) {
                                                styleMap[attr] = cssStyle;
                                            }
                                            break;
                                    }
                                }
                            }
                            if (main.settings.preloadImages &&
                                hasValue(styleMap['backgroundImage']) &&
                                styleMap['backgroundImage'] !== 'initial')
                            {
                                styleMap['backgroundImage']
                                    .split(',')
                                    .map(value => value.trim())
                                    .forEach(value => {
                                        const url = parseBackgroundUrl(value);
                                        if (url !== '' && !cacheImage.has(url)) {
                                            cacheImage.set(url, { width: 0, height: 0, url });
                                        }
                                    });
                            }
                            const data = getElementCache(element, 'styleMap');
                            if (data != null) {
                                Object.assign(data, styleMap);
                            }
                            else {
                                setElementCache(element, 'style', style);
                                setElementCache(element, 'styleMap', styleMap);
                            }
                        });
                }
                catch (error) {
                    if (!warning) {
                        alert('External CSS files cannot be parsed when loading this program from your hard drive with Chrome 64+ (file://). Either use a local web ' +
                              'server (http://), embed your CSS files into a <style> tag, or use a different browser. See the README for further instructions.\n\n' +
                              `${styleSheet.href}\n\n${error}`);
                        warning = true;
                    }
                }
            }
        }
    }
}

function setImageCache(element: HTMLImageElement) {
    if (element && hasValue(element.src)) {
        cacheImage.set(element.src, {
            width: element.naturalWidth,
            height: element.naturalHeight,
            url: element.src
        });
    }
}

export function setFramework(name: string, cached = false) {
    if (framework !== name) {
        switch (name) {
            case 'android':
                main = new Application();
                const appBase = cached ? android.cached() : android.create();
                main.settings = appBase.settings;
                main.builtInExtensions = appBase.builtInExtensions;
                main.Node = appBase.Node;
                main.registerController(appBase.Controller);
                main.registerResource(appBase.Resource);
                settings = appBase.settings;
                system = android.system;
                framework = name;
                break;
        }
        if (framework === name) {
            reset();
            if (Array.isArray(settings.builtInExtensions)) {
                const register = new Set<Extension<T>>();
                const extensions = <ObjectMap<Extension<T>>> main.builtInExtensions;
                for (let namespace of settings.builtInExtensions) {
                    namespace = namespace.toLowerCase().trim();
                    if (extensions[namespace] != null) {
                        register.add(extensions[namespace]);
                    }
                    else {
                        for (const ext in extensions) {
                            if (ext.startsWith(`${namespace}.`)) {
                                register.add(extensions[ext]);
                            }
                        }
                    }
                }
                for (const ext of register) {
                    main.registerExtension(ext);
                }
            }
        }
    }
}

export function parseDocument(...elements: Null<string | HTMLElement>[]) {
    if (main.closed) {
        return;
    }
    main.loading = false;
    setStyleMap();
    main.elements.clear();
    if (main.appName === '' && elements.length === 0) {
        elements.push(document.body);
    }
    let rootElement: Null<HTMLElement> = null;
    for (let element of elements) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element instanceof HTMLElement) {
            if (rootElement == null) {
                rootElement = element;
            }
            main.elements.add(element);
        }
    }
    let __THEN: () => void;
    function parseResume() {
        main.loading = false;
        if (main.settings.preloadImages && rootElement != null) {
            Array.from(rootElement.getElementsByClassName('androme.preload')).forEach(element => rootElement && rootElement.removeChild(element));
        }
        main.Resource.imageDimensions = cacheImage;
        for (const element of main.elements) {
            if (main.appName === '') {
                if (element.id === '') {
                    element.id = 'untitled';
                }
                main.appName = element.id;
            }
            else {
                if (element.id === '') {
                    element.id = `content_${main.size}`;
                }
            }
            const filename: string = optional(element, 'dataset.filename').trim().replace(/\.xml$/, '') || element.id;
            element.dataset.views = ((optional(element, 'dataset.views', 'number') as number) + 1).toString();
            element.dataset.viewName = convertWord(element.dataset.views !== '1' ? `${filename}_${element.dataset.views}` : filename);
            if (main.createNodeCache(element)) {
                main.createLayoutXml();
                main.setConstraints();
                main.setResources();
                cacheRoot.add(element);
            }
        }
        if (typeof __THEN === 'function') {
            __THEN.call(main);
        }
    }
    if (main.settings.preloadImages && rootElement != null) {
        for (const image of cacheImage.values()) {
            if (image.width === 0 && image.height === 0 && image.url) {
                const imageElement = <HTMLImageElement> document.createElement('IMG');
                imageElement.src = image.url;
                if (imageElement.complete && imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
                    image.width = imageElement.naturalWidth;
                    image.height = imageElement.naturalHeight;
                }
                else {
                    imageElement.className = 'androme.preload';
                    imageElement.style.display = 'none';
                    rootElement.appendChild(imageElement);
                }
            }
        }
    }
    const images: HTMLImageElement[] =
        Array.from(main.elements).map(element => {
            const queue: HTMLImageElement[] = [];
            Array.from(element.querySelectorAll('IMG'))
                .forEach((image: HTMLImageElement) => {
                    if (image.complete) {
                        setImageCache(image);
                    }
                    else {
                        queue.push(image);
                    }
                });
            return queue;
        })
        .reduce((a, b) => a.concat(b), []);
    if (images.length === 0) {
        parseResume();
    }
    else {
        main.loading = true;
        const queue = images.map(image => {
            return (
                new Promise((resolve, reject) => {
                    image.onload = resolve;
                    image.onerror = reject;
                })
            );
        });
        Promise
            .all(queue)
            .then(result => {
                try {
                    result.forEach((evt: Event) => setImageCache(<HTMLImageElement> evt.srcElement));
                }
                catch {
                }
                parseResume();
            })
            .catch((err: Event) => {
                const message = err.srcElement ? (<HTMLImageElement> err.srcElement).src : '';
                if (!hasValue(message) || confirm(`FAIL: ${message}`)) {
                    parseResume();
                }
            });
    }
    return {
        then: (resolve: () => void) => {
            if (main.loading) {
                __THEN = resolve;
            }
            else {
                resolve();
            }
        }
    };
}

export function registerExtension(ext: Extension<T>) {
    if (ext instanceof Extension && isString(ext.name) && Array.isArray(ext.tagNames)) {
        main.registerExtension(ext);
    }
}

export function configureExtension(name: string, options: {}) {
    const ext = main.getExtension(name);
    if (ext != null && typeof options === 'object') {
        Object.assign(ext.options, options);
    }
}

export function getExtension(name: string) {
    return main.getExtension(name);
}

export function ext(name: any, options?: {}) {
    if (typeof name === 'object') {
        registerExtension(name);
    }
    else if (isString(name)) {
        if (typeof options === 'object') {
            configureExtension(name, options);
        }
        else {
            return getExtension(name);
        }
    }
}

export function ready() {
    return !main.loading && !main.closed;
}

export function close() {
    if (!main.loading && main.size > 0) {
        main.finalize();
    }
}

export function reset() {
    if (main != null) {
        for (const element of cacheRoot) {
            delete element.dataset.views;
            delete element.dataset.viewName;
        }
        cacheRoot.clear();
        main.reset();
    }
}

export function saveAllToDisk() {
    if (!main.loading && main.size > 0) {
        if (!main.closed) {
            main.finalize();
        }
        main.Resource.file.saveAllToDisk(main.viewData);
    }
}

export function toString() {
    return main.toString();
}

setFramework('android');

export { settings, system, Extension };
import { BUILD_ANDROID } from '../../lib/enumeration';

import ANIMATEDVECTOR_TMPL from '../../template/resource/animated-vector';
import LAYERLIST_TMPL from '../../template/resource/layer-list';
import VECTOR_TMPL from '../../template/resource/vector';

import Resource from '../../resource';
import View from '../../view';

import { getXmlNs } from '../../lib/util';

import $Svg = androme.lib.base.Svg;
import $SvgBuild = androme.lib.base.SvgBuild;

import $color = androme.lib.color;
import $svg = androme.lib.svg;
import $util = androme.lib.util;
import $xml = androme.lib.xml;

type PropertyValue = {
    propertyName: string;
    keyframes: KeyFrame[];
};

type KeyFrame = {
    fraction: string;
    value: string;
    interpolator?: string;
};

type AnimatePath = {
    animate: SvgAnimate[];
    pathData?: string;
};

function getSvgOffset(element: SVGGraphicsElement) {
    let parent = element.parentElement;
    let x = 0;
    let y = 0;
    while (parent instanceof SVGSVGElement && parent.parentElement instanceof SVGSVGElement) {
        const attributes = $svg.getTransformData(parent);
        x += parent.x.baseVal.value + attributes.translateX;
        y += parent.y.baseVal.value + attributes.translateY;
        parent = parent.parentElement;
    }
    return { x, y };
}

export default class ResourceSvg<T extends View> extends androme.lib.base.Extension<T> {
    public readonly options = {
        vectorColorResourceValue: true
    };

    public readonly eventOnly = true;

    public beforeInit() {
        this.application.controllerHandler.localSettings.unsupported.tagName.delete('svg');
    }

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.svgElement && node.element.children.length) {
                const svg = new $Svg(<SVGSVGElement> node.element);
                svg.defs.image.forEach(item => {
                    const dimensions = Resource.ASSETS.images.get(item.uri);
                    if (dimensions) {
                        if (item.width === 0) {
                            item.width = dimensions.width;
                        }
                        if (item.height === 0) {
                            item.height = dimensions.height;
                        }
                    }
                });
                let result = '';
                let vectorName = '';
                const animateMap = new Map<string, AnimatePath>();
                const templateName = `${node.tagName.toLowerCase()}_${node.controlId}`;
                const hasImage = svg.defs.image.some(item => item.viewable);
                if (svg.length) {
                    const namespace = new Set<string>();
                    const groups: StringMap[] = [];
                    const opacity = svg.animate.filter(item => item.attributeName === 'opacity');
                    if (opacity.length) {
                        animateMap.set(svg.name, { animate: opacity });
                    }
                    for (const group of svg.children) {
                        const data: ExternalData = {
                            name: group.name,
                            '2': []
                        };
                        if (group.element !== node.element) {
                            const transform = $svg.getTransformData(group.element);
                            let x = group.x || 0;
                            let y = group.y || 0;
                            if (transform.operations.length) {
                                x += transform.translateX;
                                y += transform.translateY;
                                if (transform.scaleX !== 1) {
                                    data.scaleX = transform.scaleX.toString();
                                }
                                if (transform.scaleY !== 1) {
                                    data.scaleY = transform.scaleY.toString();
                                }
                                if (transform.rotateAngle !== 0) {
                                    data.rotation = transform.rotateAngle.toString();
                                }
                                let pivotX = transform.rotateOriginX || 0;
                                let pivotY = transform.rotateOriginY || 0;
                                if (transform.origin) {
                                    pivotX += transform.origin.x;
                                    pivotY += transform.origin.y;
                                }
                                if (pivotX !== 0) {
                                    data.pivotX = pivotX.toString();
                                }
                                if (pivotY !== 0) {
                                    data.pivotY = pivotY.toString();
                                }
                            }
                            if (x !== 0) {
                                data.translateX = x.toString();
                            }
                            if (y !== 0) {
                                data.translateY = y.toString();
                            }
                            if (group.animate.length) {
                                animateMap.set(group.name, { animate: group.animate });
                            }
                        }
                        for (const item of group.children) {
                            if (item.visibility) {
                                const clipPaths: ExternalData[] = [];
                                if (item.clipPath !== '') {
                                    const clipPath = svg.defs.clipPath.get(item.clipPath);
                                    if (clipPath) {
                                        clipPath.forEach(path => clipPaths.push({ name: path.name, d: path.d }));
                                    }
                                }
                                const itemPath = Object.assign({}, item, { clipPaths });
                                ['fill', 'stroke'].forEach(attr => {
                                    if ($util.isString(itemPath[attr])) {
                                        if (itemPath[attr].charAt(0) === '@') {
                                            const gradient = svg.defs.gradient.get(itemPath[attr]);
                                            if (gradient) {
                                                switch (itemPath.element.tagName) {
                                                    case 'path':
                                                        if (!/[zZ]\s*$/.test(itemPath.d)) {
                                                            break;
                                                        }
                                                    case 'rect':
                                                    case 'polygon':
                                                    case 'circle':
                                                    case 'ellipse':
                                                        const gradients = Resource.createBackgroundGradient(node, [gradient], itemPath, this.options.vectorColorResourceValue);
                                                        itemPath[attr] = [{ gradients }];
                                                        namespace.add('aapt');
                                                        return;
                                                }
                                            }
                                            else {
                                                itemPath[attr] = itemPath.color;
                                            }
                                        }
                                        if (this.options.vectorColorResourceValue) {
                                            const colorName = Resource.addColor(itemPath[attr]);
                                            if (colorName !== '') {
                                                itemPath[attr] = `@color/${colorName}`;
                                            }
                                        }
                                    }
                                });
                                if (itemPath.fillRule) {
                                    switch (itemPath.fillRule) {
                                        case 'evenodd':
                                            itemPath.fillRule = 'evenOdd';
                                            break;
                                        default:
                                            itemPath.fillRule = 'nonZero';
                                            break;
                                    }
                                }
                                if (itemPath.animate.length) {
                                    animateMap.set(itemPath.name, {
                                        pathData: itemPath.d,
                                        animate: itemPath.animate
                                    });
                                }
                                delete itemPath.animate;
                                data['2'].push(itemPath);
                            }
                        }
                        if (data['2'].length) {
                            groups.push(data);
                        }
                    }
                    let xml = $xml.createTemplate($xml.parseTemplate(VECTOR_TMPL), {
                        namespace: namespace.size ? getXmlNs(...Array.from(namespace)) : '',
                        name: svg.name,
                        width: $util.formatPX(svg.width),
                        height: $util.formatPX(svg.height),
                        viewportWidth: svg.viewBoxWidth > 0 ? svg.viewBoxWidth.toString() : false,
                        viewportHeight: svg.viewBoxHeight > 0 ? svg.viewBoxHeight.toString() : false,
                        alpha: svg.opacity < 1 ? svg.opacity.toString() : false,
                        '1': groups
                    });
                    vectorName = Resource.getStoredName('drawables', xml);
                    if (vectorName === '') {
                        vectorName = templateName + (hasImage ? '_vector' : '');
                        Resource.STORED.drawables.set(vectorName, xml);
                    }
                    if (animateMap.size) {
                        const data: ExternalData = {
                            vectorName,
                            '1': []
                        };
                        for (const [name, group] of animateMap.entries()) {
                            const animate: ExternalData = {
                                name,
                                objectAnimator: []
                            };
                            const animatorMap = new Map<string, PropertyValue[]>();
                            for (const item of group.animate) {
                                const options: ExternalData = {
                                    valueType: '',
                                    duration: (item.duration * 1000 + item.durationMS).toString(),
                                    repeatCount: item.repeatCount === -1 ? '0' : item.repeatCount.toString(),
                                    repeatMode: '',
                                    startOffset: '',
                                    fillAfter: '',
                                    fillBefore: '',
                                    fillEnabled: ''
                                };
                                switch (item.attributeName) {
                                    case 'stroke':
                                    case 'fill':
                                        break;
                                    case 'opacity':
                                    case 'stroke-opacity':
                                    case 'fill-opacity':
                                        options.valueType = 'floatType';
                                        break;
                                    case 'stroke-width':
                                        options.valueType = 'intType';
                                        break;
                                    case 'x':
                                    case 'x1':
                                    case 'x2':
                                    case 'cx':
                                    case 'y':
                                    case 'y1':
                                    case 'y2':
                                    case 'cy':
                                        options.valueType = 'pathType';
                                        break;
                                    default:
                                        continue;
                                }
                                let propertyName: string | undefined;
                                let values: string[] | undefined;
                                switch (options.valueType) {
                                    case 'intType': {
                                        values = item.values.map(value => $util.convertInt(value).toString());
                                        switch (item.attributeName) {
                                            case 'stroke-width':
                                                propertyName = 'strokeWidth';
                                                break;
                                        }
                                        break;
                                    }
                                    case 'floatType': {
                                        values = item.values.map(value => $util.convertFloat(value).toString());
                                        switch (item.attributeName) {
                                            case 'opacity':
                                                propertyName = 'alpha';
                                                break;
                                            case 'stroke-opacity':
                                                propertyName = 'strokeAlpha';
                                                break;
                                            case 'fill-opacity':
                                                propertyName = 'fillAlpha';
                                                break;
                                        }
                                        break;
                                    }
                                    case 'pathType': {
                                        if (group.pathData) {
                                            const pathPoints = $SvgBuild.toPathCommandList(group.pathData);
                                            if (pathPoints.length > 1) {
                                                values = item.values.slice();
                                                for (let i = 0; i < values.length; i++) {
                                                    const value = values[i];
                                                    if (value !== '') {
                                                        let x = 0;
                                                        let y = 0;
                                                        switch (item.attributeName) {
                                                            case 'x':
                                                            case 'x1':
                                                            case 'x2':
                                                            case 'cx':
                                                                x = $util.convertFloat(value);
                                                                break;
                                                            case 'y':
                                                            case 'y1':
                                                            case 'y2':
                                                            case 'cy':
                                                                y = $util.convertFloat(value);
                                                                break;
                                                        }
                                                        if (x !== 0 || y !== 0) {
                                                            const commandStart = pathPoints[0];
                                                            const commandEnd = pathPoints[pathPoints.length - 1];
                                                            const [firstPoint, lastPoint] = [commandStart.points[0], commandEnd.points[commandEnd.points.length - 1]];
                                                            let recalibrate = false;
                                                            switch (item.attributeName) {
                                                                case 'x':
                                                                    x -= firstPoint.x;
                                                                    recalibrate = true;
                                                                    break;
                                                                case 'y':
                                                                    y -= firstPoint.y;
                                                                    recalibrate = true;
                                                                    break;
                                                                case 'x1':
                                                                case 'cx':
                                                                    firstPoint.x = x;
                                                                    commandStart.coordinates[0] = x;
                                                                    break;
                                                                case 'y1':
                                                                case 'cy':
                                                                    firstPoint.y = y;
                                                                    commandStart.coordinates[1] = y;
                                                                    break;
                                                                case 'x2':
                                                                    lastPoint.x = x;
                                                                    commandEnd.coordinates[0] = x;
                                                                    break;
                                                                case 'y2':
                                                                    lastPoint.y = y;
                                                                    commandEnd.coordinates[1] = y;
                                                                    break;
                                                            }
                                                            if (recalibrate) {
                                                                for (const path of pathPoints) {
                                                                    if (!path.relative) {
                                                                        for (let j = 0, k = 0; j < path.coordinates.length; j += 2, k++) {
                                                                            path.coordinates[j] += x;
                                                                            path.coordinates[j + 1] += y;
                                                                            const pt = path.points[k];
                                                                            pt.x += x;
                                                                            pt.y += y;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            values[i] = $SvgBuild.fromPathCommandList(pathPoints);
                                                        }
                                                        else {
                                                            values[i] = values[i - 1] || group.pathData;
                                                        }
                                                    }
                                                }
                                                propertyName = 'pathData';
                                            }
                                        }
                                        break;
                                    }
                                    default: {
                                        values = item.values.slice();
                                        switch (item.attributeName) {
                                            case 'fill':
                                                propertyName = 'fillColor';
                                            case 'stroke':
                                                propertyName = 'strokeColor';
                                                break;
                                        }
                                        if (propertyName !== '') {
                                            for (let i = 0; i < values.length; i++) {
                                                const color = $color.parseRGBA(values[i]);
                                                if (color) {
                                                    values[i] = `@color/${Resource.addColor(color)}`;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (propertyName && values) {
                                    if (node.localSettings.targetAPI >= BUILD_ANDROID.MARSHMALLOW && values.length === item.keyTimes.length && item.keyTimes.length > 0) {
                                        const keyName = JSON.stringify(options);
                                        const propertyValues: PropertyValue[] = animatorMap.get(keyName) || [];
                                        const keyframes: KeyFrame[] = [];
                                        for (let i = 0; i < item.keyTimes.length; i++) {
                                            const value = values[i];
                                            keyframes.push({
                                                fraction: value !== '' ? item.keyTimes[i].toString() : '',
                                                value
                                            });
                                        }
                                        propertyValues.push({
                                            propertyName,
                                            keyframes
                                        });
                                        if (!animatorMap.has(keyName)) {
                                            animatorMap.set(keyName, propertyValues);
                                            options.propertyValues = propertyValues;
                                            animate['objectAnimator'].push(options);
                                        }
                                    }
                                    else {
                                        options.propertyName = propertyName;
                                        options.valueFrom = values[0];
                                        options.valueTo = values[values.length - 1];
                                        options.propertyValues = false;
                                        animate['objectAnimator'].push(options);
                                    }
                                }
                            }
                            if (animate['objectAnimator'].length) {
                                data['1'].push(animate);
                            }
                        }
                        if (data['1'].length) {
                            xml = $xml.createTemplate($xml.parseTemplate(ANIMATEDVECTOR_TMPL), data);
                            vectorName = Resource.getStoredName('drawables', xml);
                            if (vectorName === '') {
                                vectorName = `${templateName}_animated${hasImage ? '_vector' : ''}`;
                                Resource.STORED.drawables.set(vectorName, xml);
                            }
                        }
                    }
                }
                if (hasImage) {
                    const images: ExternalData = [];
                    const rotate: ExternalData = [];
                    for (const item of svg.defs.image) {
                        if (item.viewable) {
                            const scaleX = svg.width / svg.viewBoxWidth;
                            const scaleY = svg.height / svg.viewBoxHeight;
                            let x = (item.x || 0) * scaleX;
                            let y = (item.y || 0) * scaleY;
                            item.width *= scaleX;
                            item.height *= scaleY;
                            const offsetParent = getSvgOffset(item.element);
                            x += offsetParent.x;
                            y += offsetParent.y;
                            const data: ExternalData = {
                                width: item.width > 0 ? $util.formatPX(item.width) : '',
                                height: item.height > 0 ? $util.formatPX(item.height) : '',
                                left: x !== 0 ? $util.formatPX(x) : '',
                                top: y !== 0 ? $util.formatPX(y) : '',
                                src: Resource.addImage({ mdpi: item.uri })
                            };
                            const transform = $svg.getTransformData(item.element);
                            if (transform.rotateAngle !== 0) {
                                data.fromDegrees = transform.rotateAngle.toString();
                                data.visible = item.visibility ? 'true' : 'false';
                                rotate.push(data);
                            }
                            else {
                                images.push(data);
                            }
                        }
                    }
                    const xml = $xml.createTemplate($xml.parseTemplate(LAYERLIST_TMPL), {
                        '1': false,
                        '2': false,
                        '3': [{ vectorName }],
                        '4': rotate,
                        '5': images,
                        '6': false,
                        '7': false
                    });
                    result = Resource.getStoredName('drawables', xml);
                    if (result === '') {
                        result = templateName;
                        Resource.STORED.drawables.set(result, xml);
                    }
                }
                else {
                    result = vectorName;
                }
                if (result !== '') {
                    node.android('src', `@drawable/${result}`);
                }
                if (!node.hasWidth) {
                    node.android('layout_width', 'wrap_content');
                }
                if (!node.hasHeight) {
                    node.android('layout_height', 'wrap_content');
                }
            }
        }
    }

    public afterFinalize() {
        this.application.controllerHandler.localSettings.unsupported.tagName.add('svg');
    }
}
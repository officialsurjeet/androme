import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';

export default class SvgAnimateTransform extends SvgAnimate implements androme.lib.base.SvgAnimateTransform {
    public static toRotateList(values: string[]) {
        const result = values.map(value => {
            if (value === '') {
                return [null, null, null];
            }
            else {
                const segment = SvgBuild.toCoordinateList(value);
                if (segment.length === 1 || segment.length === 3) {
                    return segment;
                }
                return [];
            }
        });
        return result.some(item => item.length === 0) ? [] : result;
    }

    public static toScaleList(values: string[]) {
        const result = values.map(value => {
            if (value === '') {
                return [null, null];
            }
            else {
                const segment = SvgBuild.toCoordinateList(value);
                if (segment.length === 1) {
                    return [segment[0], segment[0]];
                }
                else if (segment.length === 2) {
                    return segment;
                }
                return [];
            }
        });
        return result.some(item => item.length === 0) ? [] : result;
    }

    public static toTranslateList(values: string[]) {
        const result = values.map(value => {
            if (value === '') {
                return [null, null];
            }
            else {
                const segment = SvgBuild.toCoordinateList(value);
                if (segment.length === 1 || segment.length === 2) {
                    return segment;
                }
                return [];
            }
        });
        return result.some(item => item.length === 0) ? [] : result;
    }

    public type = 0;
    public path = '';
    public keyPoints: number[] = [];
    public rotate = '';

    constructor(element: SVGAnimateTransformElement, parentElement: SVGGraphicsElement) {
        super(element, parentElement);
        const type = element.attributes.getNamedItem('type');
        if (type) {
            switch (type.value) {
                case 'translate':
                    this.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                    break;
                case 'scale':
                    this.type = SVGTransform.SVG_TRANSFORM_SCALE;
                    break;
                case 'rotate':
                    this.type = SVGTransform.SVG_TRANSFORM_ROTATE;
                    break;
                case 'skewX':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWX;
                    break;
                case 'skewY':
                    this.type = SVGTransform.SVG_TRANSFORM_SKEWY;
                    break;
            }
        }
        const additive = element.attributes.getNamedItem('additive');
        if (additive) {
            this.additive = additive.value === 'sum';
        }
        const accumulate = element.attributes.getNamedItem('accumulate');
        if (accumulate) {
            this.accumulate = accumulate.value === 'sum';
        }
        const fill = element.attributes.getNamedItem('fill');
        if (fill) {
            this.freeze = fill.value === 'freeze';
        }
    }
}
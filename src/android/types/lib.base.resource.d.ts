import { UserSettingsAndroid } from './module';
import { BackgroundGradient } from '../template/resource/types/data';

declare global {
    namespace android.lib.base {
        export interface Resource<T extends View> extends androme.lib.base.Resource<T> {
            readonly userSettings: UserSettingsAndroid;
            addStyleTheme(template: string, data: ExternalData, options: ExternalData): void;
        }

        export class Resource<T extends View> implements Resource<T> {
            public static createBackgroundGradient<T extends View>(node: T, gradients: Gradient[], path?: androme.lib.base.SvgPath): BackgroundGradient[];
            public static formatOptions(options: ExternalData, numberAlias?: boolean): ExternalData;
            public static getOptionArray(element: HTMLSelectElement): (string[] | null)[];
            public static addString(value: string, name?: string, numberAlias?: boolean): string;
            public static addImageSrcSet(element: HTMLImageElement, prefix?: string): string;
            public static addImage(images: StringMap, prefix?: string): string;
            public static addImageUrl(value: string, prefix?: string): string;
            public static addColor(value: ColorData | string | null): string;
        }
    }
}

export {};
import { BackgroundGradient, SettingsAndroid } from './local';

declare global {
    namespace android.lib.base {
        export interface Resource<T extends View> extends androme.lib.base.Resource<T> {
            fileHandler: File<T>;
            createBackgroundGradient(node: T, gradients: Gradient[]): BackgroundGradient[];
            addStyleTheme(template: string, data: TemplateData, options: ExternalData): void;
        }

        export class Resource<T extends View> implements Resource<T> {
            public static formatOptions(options: ExternalData, settings?: SettingsAndroid): ExternalData;
            public static addString(value: string, name?: string, settings?: SettingsAndroid): string;
            public static addImageSrcSet(element: HTMLImageElement, prefix?: string): string;
            public static addImage(images: StringMap, prefix?: string): string;
            public static addImageURL(value: string, prefix?: string): string;
            public static addColor(value: ColorHexAlpha | string | null): string;
            public static getStoredName(resource: string, value: any): string;
        }
    }
}

export {};
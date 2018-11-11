declare global {
    namespace androme.lib.base {
        export interface Resource<T extends Node> extends AppCurrent<T> {
            settings: Settings;
            cache: NodeList<T>;
            application: Application<T>;
            imageAssets: Map<string, ImageAsset>;
            fileHandler: File<T>;
            afterProcedure(viewData: ViewData<NodeList<T>>): void;
            finalize(viewData: ViewData<NodeList<T>>): void;
            reset(): void;
            setBoxSpacing(): void;
            setBoxStyle(): void;
            setFontStyle(): void;
            setValueString(): void;
            setImageSource(): void;
            setOptionArray(): void;
        }

        export class Resource<T extends Node> implements Resource<T> {
            public static STORED: ResourceMap;
            public static KEY_NAME: string;
            public static getSvgTransform(element: SVGGraphicsElement): SvgTransformAttributes;
            public static insertStoredAsset(asset: string, name: string, value: any): string;
            public static isBorderVisible(border: BorderAttribute | undefined): boolean;
            public static hasDrawableBackground(object: BoxStyle | undefined): boolean;
            constructor(fileHandler: File<T>);
        }
    }
}

export {};
declare global {
    namespace androme.lib.base {
        export class Node implements BoxModel {
            public id: number;
            public style: CSSStyleDeclaration;
            public styleMap: StringMap;
            public nodeId: string;
            public nodeType: number;
            public alignmentType: number;
            public depth: number;
            public siblingIndex: number;
            public renderIndex: number;
            public renderPosition: number;
            public box: BoxDimensions;
            public bounds: BoxDimensions;
            public linear: BoxDimensions;
            public excludeSection: number;
            public excludeProcedure: number;
            public excludeResource: number;
            public renderExtension: Set<Extension<Node>>;
            public documentRoot: boolean;
            public auto: boolean;
            public visible: boolean;
            public excluded: boolean;
            public rendered: boolean;
            public children: Node[];
            public companion: Node;
            public constraint: {};
            public readonly renderChildren: Node[];
            public readonly initial: InitialData<Node>;
            public readonly documentParent: Node;
            public readonly linearHorizontal: boolean;
            public readonly linearVertical: boolean;
            public readonly layoutHorizontal: boolean;
            public readonly layoutVertical: boolean;
            public readonly inlineWidth: boolean;
            public readonly inlineHeight: boolean;
            public readonly blockWidth: boolean;
            public readonly blockHeight: boolean;
            public readonly baseElement: Element;
            public readonly tagName: string;
            public readonly htmlElement: boolean;
            public readonly domElement: boolean;
            public readonly styleElement: boolean;
            public readonly documentBody: boolean;
            public readonly dataset: DOMStringMap;
            public readonly extension: string;
            public readonly flex: Flexbox;
            public readonly viewWidth: number;
            public readonly viewHeight: number;
            public readonly hasWidth: boolean;
            public readonly hasHeight: boolean;
            public readonly lineHeight: number;
            public readonly display: string;
            public readonly position: string;
            public readonly top: number | null;
            public readonly right: number | null;
            public readonly bottom: number | null;
            public readonly left: number | null;
            public readonly marginTop: number;
            public readonly marginRight: number;
            public readonly marginBottom: number;
            public readonly marginLeft: number;
            public readonly borderTopWidth: number;
            public readonly borderRightWidth: number;
            public readonly borderBottomWidth: number;
            public readonly borderLeftWidth: number;
            public readonly paddingTop: number;
            public readonly paddingRight: number;
            public readonly paddingBottom: number;
            public readonly paddingLeft: number;
            public readonly siblingflow: boolean;
            public readonly inline: boolean;
            public readonly inlineElement: boolean;
            public readonly inlineStatic: boolean;
            public readonly inlineText: boolean;
            public readonly plainText: boolean;
            public readonly imageElement: boolean;
            public readonly svgElement: boolean;
            public readonly imageOrSvgElement: boolean;
            public readonly lineBreak: boolean;
            public readonly textElement: boolean;
            public readonly block: boolean;
            public readonly blockStatic: boolean;
            public readonly alignOrigin: boolean;
            public readonly alignNegative: boolean;
            public readonly autoMargin: boolean;
            public readonly autoMarginLeft: boolean;
            public readonly autoMarginRight: boolean;
            public readonly autoMarginHorizontal: boolean;
            public readonly autoMarginVertical: boolean;
            public readonly floating: boolean;
            public readonly float: string;
            public readonly textContent: string;
            public readonly overflowX: boolean;
            public readonly overflowY: boolean;
            public readonly baseline: boolean;
            public readonly baselineInside: boolean;
            public readonly preserveWhiteSpace: boolean;
            public readonly actualHeight: number;
            public readonly singleChild: boolean;
            public readonly dir: string;
            public readonly nodes: Node[];
            public readonly length: number;
            public readonly previousElementSibling: Null<Element>;
            public readonly nextElementSibling: Null<Element>;
            public readonly firstElementChild: Null<Element>;
            public readonly lastElementChild: Null<Element>;
            public readonly center: Point;
            public parent: Node;
            public controlName: string;
            public renderParent: Node;
            public nodeName: string;
            public element: Element;
            public renderAs: Node;
            public renderDepth: number;
            public pageflow: boolean;
            public multiLine: boolean;
            constructor(id: number, element?: Element);
            public setNodeType(viewName: string): void;
            public setLayout(): void;
            public setAlignment(settings: Settings): void;
            public setBoxSpacing(settings: Settings): void;
            public applyOptimizations(settings: Settings): void;
            public applyCustomizations(settings: Settings): void;
            public modifyBox(region: number | string, offset: number | null, negative?: boolean): void;
            public valueBox(region: number): string[];
            public clone(id?: number, children?: boolean): Node;
            public init(): void;
            public is(...views: number[]): boolean;
            public of(nodeType: number, ...alignmentType: number[]): boolean;
            public attr(obj: string, attr: string, value?: string, overwrite?: boolean): string;
            public get(obj: string): StringMap;
            public delete(obj: string, ...attrs: string[]): void;
            public apply(options: {}): void;
            public each(predicate: IteratorPredicate<Node, void>, rendered?: boolean): this;
            public render(parent: Node): void;
            public hide(): void;
            public data(obj: string, attr: string, value?: any, overwrite?: boolean): any;
            public ascend(generated?: boolean, levels?: number): Node[];
            public cascade(): Node[];
            public inherit(node: Node, ...props: string[]): void;
            public alignedVertically(previous: Null<Node>, cleared?: Map<Node, string>, firstNode?: boolean): boolean;
            public intersect(rect: BoxDimensions, dimension?: string): boolean;
            public intersectX(rect: BoxDimensions, dimension?: string): boolean;
            public intersectY(rect: BoxDimensions, dimension?: string): boolean;
            public withinX(rect: BoxDimensions, dimension?: string): boolean;
            public withinY(rect: BoxDimensions, dimension?: string): boolean;
            public outsideX(rect: BoxDimensions, dimension?: string): boolean;
            public outsideY(rect: BoxDimensions, dimension?: string): boolean;
            public css(attr: string | object, value?: string): string;
            public cssInitial(attr: string, complete?: boolean): string;
            public cssParent(attr: string, startChild?: boolean, ignoreHidden?: boolean): string;
            public has(attr: string, checkType?: number, options?: {}): boolean;
            public isSet(obj: string, attr: string): boolean;
            public hasBit(attr: string, value: number): boolean;
            public toInt(attr: string, defaultValue?: number, options?: StringMap): number;
            public hasAlign(value: number): boolean;
            public setExclusions(): void;
            public setBounds(calibrate?: boolean): void;
            public setDimensions(region?: string[]): void;
            public setMultiLine(): void;
            public getParentElementAsNode(negative?: boolean, containerDefault?: Node): Node | null;
            public removeChild(node: Node): void;
            public replaceChild(node: Node, withNode: Node, append?: boolean): void;
            public appendRendered(node: Node): void;
            public resetBox(region: number, node?: Node, negative?: boolean): void;
            public removeElement(): void;
            public previousSibling(pageflow?: boolean, lineBreak?: boolean, excluded?: boolean): Node | null;
            public nextSibling(pageflow?: boolean, lineBreak?: boolean, excluded?: boolean): Node | null;
            public actualLeft(dimension?: string): number;
            public actualRight(dimension?: string): number;
        }
        export class NodeGroup<T extends Node> extends Node {}
    }
}

export {};
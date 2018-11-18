declare global {
    namespace androme.lib.base {
        export interface InitialData<T> {
            readonly styleMap: StringMap;
            readonly children: T[];
            readonly bounds: BoxDimensions;
            linear?: BoxDimensions;
            box?: BoxDimensions;
            depth: number;
        }

        export interface Node extends Container<Node>, BoxModel {
            id: number;
            style: CSSStyleDeclaration;
            styleMap: StringMap;
            nodeId: string;
            nodeType: number;
            alignmentType: number;
            depth: number;
            siblingIndex: number;
            renderIndex: number;
            renderPosition: number;
            renderExtension: Set<Extension<Node>>;
            box: BoxDimensions;
            bounds: BoxDimensions;
            linear: BoxDimensions;
            excludeSection: number;
            excludeProcedure: number;
            excludeResource: number;
            documentRoot: boolean;
            positioned: boolean;
            visible: boolean;
            excluded: boolean;
            rendered: boolean;
            companion: Node;
            readonly initial: InitialData<Node>;
            readonly renderChildren: Node[];
            readonly documentParent: Node;
            readonly linearHorizontal: boolean;
            readonly linearVertical: boolean;
            readonly layoutHorizontal: boolean;
            readonly layoutVertical: boolean;
            readonly inlineWidth: boolean;
            readonly inlineHeight: boolean;
            readonly blockWidth: boolean;
            readonly blockHeight: boolean;
            readonly tagName: string;
            readonly htmlElement: boolean;
            readonly styleElement: boolean;
            readonly domElement: boolean;
            readonly imageElement: boolean;
            readonly svgElement: boolean;
            readonly groupElement: boolean;
            readonly documentBody: boolean;
            readonly dataset: DOMStringMap;
            readonly extension: string;
            readonly flex: Flexbox;
            readonly viewWidth: number;
            readonly viewHeight: number;
            readonly hasWidth: boolean;
            readonly hasHeight: boolean;
            readonly lineHeight: number;
            readonly display: string;
            readonly position: string;
            readonly top: number | null;
            readonly right: number | null;
            readonly bottom: number | null;
            readonly left: number | null;
            readonly marginTop: number;
            readonly marginRight: number;
            readonly marginBottom: number;
            readonly marginLeft: number;
            readonly borderTopWidth: number;
            readonly borderRightWidth: number;
            readonly borderBottomWidth: number;
            readonly borderLeftWidth: number;
            readonly borderVisible: boolean;
            readonly paddingTop: number;
            readonly paddingRight: number;
            readonly paddingBottom: number;
            readonly paddingLeft: number;
            readonly siblingflow: boolean;
            readonly inline: boolean;
            readonly inlineElement: boolean;
            readonly inlineStatic: boolean;
            readonly inlineText: boolean;
            readonly plainText: boolean;
            readonly lineBreak: boolean;
            readonly textElement: boolean;
            readonly block: boolean;
            readonly blockStatic: boolean;
            readonly alignOrigin: boolean;
            readonly alignNegative: boolean;
            readonly autoMargin: boolean;
            readonly autoMarginLeft: boolean;
            readonly autoMarginRight: boolean;
            readonly autoMarginHorizontal: boolean;
            readonly autoMarginVertical: boolean;
            readonly floating: boolean;
            readonly float: string;
            readonly textContent: string;
            readonly fontSize: number;
            readonly overflowX: boolean;
            readonly overflowY: boolean;
            readonly baseline: boolean;
            readonly baselineInside: boolean;
            readonly preserveWhiteSpace: boolean;
            readonly layoutRelative: boolean;
            readonly layoutConstraint: boolean;
            readonly actualHeight: number;
            readonly singleChild: boolean;
            readonly dir: string;
            readonly nodes: Node[];
            readonly length: number;
            readonly previousElementSibling: Element | null;
            readonly nextElementSibling: Element | null;
            readonly center: Point;
            parent: Node;
            controlName: string;
            renderParent: Node;
            nodeName: string;
            element: Element;
            baseElement: Element;
            renderAs: Node;
            renderDepth: number;
            pageflow: boolean;
            multiLine: boolean;
            setNodeType(viewName: string): void;
            setBaseLayout(): void;
            setAlignment(settings: Settings): void;
            applyOptimizations(settings: Settings): void;
            applyCustomizations(settings: Settings): void;
            modifyBox(region: number | string, offset: number | null, negative?: boolean): void;
            valueBox(region: number): [number, number];
            localizeString(value: string): string;
            clone(id?: number, children?: boolean): Node;
            init(): void;
            is(...views: number[]): boolean;
            of(nodeType: number, ...alignmentType: number[]): boolean;
            attr(obj: string, attr: string, value?: string, overwrite?: boolean): string;
            namespace(obj: string): StringMap;
            delete(obj: string, ...attrs: string[]): void;
            apply(options: {}): void;
            each(predicate: IteratorPredicate<Node, void>, rendered?: boolean): this;
            render(parent: Node): void;
            hide(): void;
            data(obj: string, attr: string, value?: any, overwrite?: boolean): any;
            ascend(generated?: boolean, levels?: number): Node[];
            cascade(): Node[];
            inherit(node: Node, ...props: string[]): void;
            alignedVertically(previous: Node | null, cleared?: Map<Node, string>, floatSize?: number, firstNode?: boolean): boolean;
            intersect(rect: BoxDimensions, dimension?: string): boolean;
            intersectX(rect: BoxDimensions, dimension?: string): boolean;
            intersectY(rect: BoxDimensions, dimension?: string): boolean;
            withinX(rect: BoxDimensions, dimension?: string): boolean;
            withinY(rect: BoxDimensions, dimension?: string): boolean;
            outsideX(rect: BoxDimensions, dimension?: string): boolean;
            outsideY(rect: BoxDimensions, dimension?: string): boolean;
            css(attr: object | string, value?: string): string;
            cssInitial(attr: string, complete?: boolean): string;
            cssParent(attr: string, startChild?: boolean, ignoreHidden?: boolean): string;
            convertPX(value: string): string;
            convertPercent(value: string, horizontal: boolean, parentBounds?: boolean): string;
            has(attr: string, checkType?: number, options?: {}): boolean;
            hasBit(attr: string, value: number): boolean;
            toInt(attr: string, defaultValue?: number, initial?: boolean): number;
            hasAlign(value: number): boolean;
            setExclusions(): void;
            setBounds(calibrate?: boolean): void;
            setDimensions(region?: string[]): void;
            setMultiLine(): void;
            replaceNode(node: Node, withNode: Node, append?: boolean): void;
            appendRendered(node: Node): void;
            resetBox(region: number, node?: Node, fromParent?: boolean): void;
            inheritBox(region: number, node: Node): void;
            removeElement(): void;
            actualLeft(dimension?: string): number;
            actualRight(dimension?: string): number;
            getParentElementAsNode(negative?: boolean): Node | null;
            previousSibling(pageflow?: boolean, lineBreak?: boolean, excluded?: boolean): Node | null;
            nextSibling(pageflow?: boolean, lineBreak?: boolean, excluded?: boolean): Node | null;
        }

        export class Node implements Node {
            public static getContentBoxWidth<T extends Node>(node: T): number;
            public static getContentBoxHeight<T extends Node>(node: T): number;
            public static getNodeFromElement<T>(element: UndefNull<Element>): T | null;
        }

        export class NodeGroup<T extends Node> extends Node {}
    }
}

export {};
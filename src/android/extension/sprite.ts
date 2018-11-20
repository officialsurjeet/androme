import { NODE_ANDROID } from '../lib/constant';

import Resource from '../resource';
import View from '../view';

import $const = androme.lib.constant;
import $enum = androme.lib.enumeration;
import $util = androme.lib.util;
import $xml = androme.lib.xml;

export default class <T extends View> extends androme.lib.extensions.Sprite<T> {
    public processNode(node: T, parent: T): ExtensionResult<T> {
        let output = '';
        let container: T | undefined;
        const image = <ImageAsset> node.data($const.EXT_NAME.SPRITE, 'image');
        if (image && image.uri && image.position) {
            container = new View(this.application.processing.cache.nextId, node.element, this.application.viewController.delegateNodeInit) as T;
            container.nodeName = node.nodeName;
            container.excludeProcedure |= $enum.NODE_PROCEDURE.CUSTOMIZATION;
            container.excludeResource |= $enum.NODE_RESOURCE.IMAGE_SOURCE;
            container.inherit(node, 'initial', 'base', 'style', 'styleMap');
            container.setNodeType(NODE_ANDROID.FRAME);
            parent.replaceNode(node, container);
            this.application.processing.cache.append(container, false);
            output = $xml.getEnclosingTag(NODE_ANDROID.FRAME, container.id, container.renderDepth, $xml.formatPlaceholder(container.id));
            container.render(parent);
            node.excludeProcedure |= $enum.NODE_PROCEDURE.AUTOFIT;
            node.excludeResource |= $enum.NODE_RESOURCE.FONT_STYLE | $enum.NODE_RESOURCE.BOX_STYLE;
            node.parent = container;
            node.setNodeType(NODE_ANDROID.IMAGE, $enum.NODE_STANDARD.IMAGE);
            node.css({
                position: 'static',
                top: 'auto',
                right: 'auto',
                bottom: 'auto',
                left: 'auto',
                display: 'inline-block',
                width: $util.formatPX(image.width),
                height: $util.formatPX(image.height),
                marginTop: $util.formatPX(image.position.y),
                marginRight: '0px',
                marginBottom: '0px',
                marginLeft: $util.formatPX(image.position.x),
                paddingTop: '0px',
                paddingRight: '0px',
                paddingBottom: '0px',
                paddingLeft: '0px',
                borderTopStyle: 'none',
                borderRightStyle: 'none',
                borderBottomStyle: 'none',
                borderLeftStyle: 'none',
                borderRadius: '0px',
                backgroundPositionX: '0px',
                backgroundPositionY: '0px',
                backgroundColor: 'transparent'
            });
            node.android('src', `@drawable/${Resource.addImage({ mdpi: image.uri })}`);
        }
        return { output, parent: container, complete: true };
    }
}
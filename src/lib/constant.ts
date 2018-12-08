import { BOX_STANDARD } from './enumeration';

export const CSS_SPACING = new Map<number, string>([
    [BOX_STANDARD.MARGIN_TOP, 'marginTop'],
    [BOX_STANDARD.MARGIN_RIGHT, 'marginRight'],
    [BOX_STANDARD.MARGIN_BOTTOM, 'marginBottom'],
    [BOX_STANDARD.MARGIN_LEFT, 'marginLeft'],
    [BOX_STANDARD.PADDING_TOP, 'paddingTop'],
    [BOX_STANDARD.PADDING_RIGHT, 'paddingRight'],
    [BOX_STANDARD.PADDING_BOTTOM, 'paddingBottom'],
    [BOX_STANDARD.PADDING_LEFT, 'paddingLeft']
]);

export const ELEMENT_BLOCK = [
    'ADDRESS',
    'ARTICLE',
    'ASIDE',
    'BLOCKQUOTE',
    'CANVAS',
    'DD',
    'DIV',
    'DL',
    'DT',
    'FIELDSET',
    'FIGCAPTION',
    'FIGURE',
    'FOOTER',
    'FORM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HEADER',
    'LI',
    'MAIN',
    'NAV',
    'OL',
    'OUTPUT',
    'P',
    'PRE',
    'SECTION',
    'TFOOT',
    'TH',
    'THEAD',
    'TR',
    'UL',
    'VIDEO'
];

export const ELEMENT_INLINE = [
    'A',
    'ABBR',
    'ACRONYM',
    'B',
    'BDO',
    'BIG',
    'BR',
    'BUTTON',
    'CITE',
    'CODE',
    'DFN',
    'EM',
    'I',
    'IFRAME',
    'IMG',
    'INPUT',
    'KBD',
    'LABEL',
    'MAP',
    'OBJECT',
    'Q',
    'S',
    'SAMP',
    'SCRIPT',
    'SELECT',
    'SMALL',
    'SPAN',
    'STRIKE',
    'STRONG',
    'SUB',
    'SUP',
    'TEXTAREA',
    'TIME',
    'TT',
    'U',
    'VAR',
    'PLAINTEXT'
];

export const EXT_NAME = {
    ACCESSIBILITY: 'androme.accessibility',
    CSS_GRID: 'androme.css-grid',
    EXTERNAL: 'androme.external',
    FLEXBOX: 'androme.flexbox',
    GRID: 'androme.grid',
    LIST: 'androme.list',
    RELATIVE: 'androme.relative',
    SPRITE: 'androme.sprite',
    TABLE: 'androme.table',
    VERTICAL_ALIGN: 'androme.verticalalign',
    WHITESPACE: 'androme.whitespace'
};

export const REGEX_PATTERN = {
    CSS_URL: /url\("?(.*?)"?\)/,
    URI: /^[A-Za-z]+:\/\//,
    UNIT: /^(?:\s*(-?[\d.]+)(px|em|ch|pc|pt|vw|vh|vmin|vmax|mm|cm|in))+$/
};
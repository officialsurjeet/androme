import { NODE_CONTAINER } from './enumeration';

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

export const ELEMENT_MAP = {
    PLAINTEXT: NODE_CONTAINER.TEXT,
    HR: NODE_CONTAINER.LINE,
    SVG: NODE_CONTAINER.SVG,
    IMG: NODE_CONTAINER.IMAGE,
    SELECT: NODE_CONTAINER.SELECT,
    RANGE: NODE_CONTAINER.RANGE,
    TEXT: NODE_CONTAINER.EDIT,
    PASSWORD: NODE_CONTAINER.EDIT,
    NUMBER: NODE_CONTAINER.EDIT,
    EMAIL: NODE_CONTAINER.EDIT,
    SEARCH: NODE_CONTAINER.EDIT,
    URL: NODE_CONTAINER.EDIT,
    CHECKBOX: NODE_CONTAINER.CHECKBOX,
    RADIO: NODE_CONTAINER.RADIO,
    BUTTON: NODE_CONTAINER.BUTTON,
    SUBMIT: NODE_CONTAINER.BUTTON,
    RESET: NODE_CONTAINER.BUTTON,
    TEXTAREA: NODE_CONTAINER.EDIT
};

export const EXT_NAME = {
    ACCESSIBILITY: 'androme.accessibility',
    CSS_GRID: 'androme.css-grid',
    EXTERNAL: 'androme.external',
    FLEXBOX: 'androme.flexbox',
    GRID: 'androme.grid',
    LIST: 'androme.list',
    ORIGIN: 'androme.origin',
    PERCENT: 'androme.percent',
    RELATIVE: 'androme.relative',
    SPRITE: 'androme.sprite',
    TABLE: 'androme.table',
    WHITESPACE: 'androme.whitespace'
};

export const REGEX_PATTERN = {
    CSS_URL: /url\("?(.*?)"?\)/,
    URI: /^[A-Za-z]+:\/\//,
    UNIT: /^(?:\s*(-?[\d.]+)(px|em|ch|pc|pt|vw|vh|vmin|vmax|mm|cm|in))+$/
};
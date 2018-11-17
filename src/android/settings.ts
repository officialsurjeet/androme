import { SettingsAndroid } from './types/module';

const settings: SettingsAndroid = {
    builtInExtensions: [
        'androme.external',
        'androme.origin',
        'androme.sprite',
        'androme.css-grid',
        'androme.table',
        'androme.list',
        'androme.grid',
        'androme.percent',
        'androme.custom',
        'androme.accessibility',
        'android.constraint.guideline',
        'android.resource.includes',
        'android.resource.background',
        'android.resource.svg',
        'android.resource.strings',
        'android.resource.fonts',
        'android.resource.dimens',
        'android.resource.styles'
    ],
    resolutionDPI: 160,
    targetAPI: 26,
    supportRTL: true,
    renderInlineText: true,
    preloadImages: true,
    alwaysReevaluateResources: true,
    autoSizePaddingAndBorderWidth: true,
    ellipsisOnTextOverflow: true,
    whitespaceHorizontalOffset: 3.5,
    whitespaceVerticalOffset: 16,
    constraintChainDisabled: false,
    constraintAlignParentBottomOffset: 3.5,
    constraintPercentAccuracy: 4,
    supportNegativeLeftTop: true,
    floatOverlapDisabled: false,
    hideOffScreenElements: true,
    collapseUnattributedElements: true,
    customizationsOverwritePrivilege: true,
    showAttributes: true,
    insertSpaces: 4,
    convertPixels: 'dp',
    handleExtensionsAsync: true,
    autoCloseOnWrite: true,
    outputDirectory: 'app/src/main',
    outputMainFileName: 'activity_main.xml',
    outputArchiveFileType: 'zip',
    outputMaxProcessingTime: 30
};

export default settings;
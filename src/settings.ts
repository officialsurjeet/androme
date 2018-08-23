import { BUILD_ANDROID, DENSITY_ANDROID } from './android/constants';

const SETTINGS = {
    builtInExtensions: [
        'androme.external',
        'androme.custom',
        'androme.list',
        'androme.table',
        'androme.grid',
        'androme.widget'
    ],
    targetAPI: BUILD_ANDROID.OREO,
    density: DENSITY_ANDROID.MDPI,
    supportRTL: true,
    dimensResourceValue: true,
    numberResourceValue: false,
    fontAliasResourceValue: true,
    alwaysReevaluateResources: true,
    excludeTextColor: ['#000000'],
    excludeBackgroundColor: ['#FFFFFF'],
    autoSizePaddingAndBorderWidth: true,
    collapseUnattributedElements: false,
    constraintPercentAccuracy: 4,
    constraintChainDisabled: false,
    constraintWhitespaceHorizontalOffset: 4,
    constraintWhitespaceVerticalOffset: 16,
    constraintChainPackedHorizontalOffset: 4,
    constraintChainPackedVerticalOffset: 16,
    constraintCirclePositionAbsolute: false,
    showAttributes: true,
    customizationsOverwritePrivilege: false,
    autoCloseOnWrite: true,
    insertSpaces: 4,
    convertPixels: 'dp',
    outputDirectory: 'app/src/main',
    outputActivityMainFileName: 'activity_main.xml',
    outputArchiveFileType: 'zip',
    outputMaxProcessingTime: 30
};

export default SETTINGS;
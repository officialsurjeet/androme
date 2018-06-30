import { ObjectMap } from './lib/types';
import { BUILD_ANDROID, DENSITY_ANDROID } from './android/constants';

const SETTINGS: ObjectMap<any> = {
    builtInExtensions: [
        'androme.external',
        'androme.list',
        'androme.table',
        'androme.grid',
        'androme.widget.menu',
        'androme.widget.toolbar',
        'androme.widget.drawer'
    ],
    targetAPI: BUILD_ANDROID.OREO,
    density: DENSITY_ANDROID.MDPI,
    useConstraintLayout: true,
    useConstraintChain: true,
    useConstraintGuideline: true,
    useUnitDP: true,
    useFontAlias: true,
    supportRTL: true,
    numberResourceValue: false,
    alwaysReevaluateResources: false,
    excludeTextColor: ['#000000'],
    excludeBackgroundColor: ['#FFFFFF'],
    horizontalPerspective: true,
    whitespaceHorizontalOffset: 4,
    whitespaceVerticalOffset: 14,
    chainPackedHorizontalOffset: 4,
    chainPackedVerticalOffset: 14,
    showAttributes: true,
    autoCloseOnWrite: true,
    outputDirectory: 'app/src/main',
    outputActivityMainFileName: 'activity_main.xml',
    outputArchiveFileType: 'zip',
    outputMaxProcessingTime: 30
};

export default SETTINGS;
const template = [
'!0',
'<?xml version="1.0" encoding="utf-8"?>',
'<layer-list xmlns:android="http://schemas.android.com/apk/res/android">',
'!1',
'	<item android:top="{@top}" android:right="{@right}" android:bottom="{@bottom}" android:left="{@left}">',
'		<shape android:shape="rectangle">',
        '!2',
'			<stroke android:width="{&width}" {borderStyle} />',
        '!2',
        '!3',
'			<solid android:color="{&color}" />',
        '!3',
        '!4',
'			<corners android:radius="{&radius}" />',
        '!4',
        '!5',
'			<corners android:topLeftRadius="{&topLeftRadius}" android:topRightRadius="{&topRightRadius}" android:bottomRightRadius="{&bottomRightRadius}" android:bottomLeftRadius="{&bottomLeftRadius}" />',
        '!5',
'		</shape>',
'	</item>',
'!1',
'!6',
'	<item android:drawable="@drawable/{image}" width="{@width}" height="{@height}" />',
'!6',
'</layer-list>',
'!0'
];

export default template.join('\n');
## chrome-mobile-layouts

The program can convert moderately complex HTML pages into XML Constraint layouts for Android. iOS and Xamarin layouts are also to be supported at some point eventually to be hosted inside a Chrome browser plugin. Currently the XML structure can be imported into your Android projects although the attributes are nowhere close to being ready for production. Supports Grid layout with rowspan and colspan optimizations. Some modification is necessary to use the layout_xml.js in your webpage. Paste the Javascript code somewhere in a function after the DOM has been fully loaded. I have only tested it with the latest Chrome. The code has to run in the global namespace or some android properties will fail.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    var DEFAULT_ANDROID = {
        TEXT: 'TextView',
        LINEAR: 'LinearLayout',
        CONSTRAINT: 'ConstraintLayout',
        GRID: 'GridLayout'
    };

    ...layout_xml.js

    console.log(output);
    console.log(output_string);
    console.log(output_string_array);
});
```

<img src="sample.png" alt="Chrome Mobile Layouts" />

## auto-generated layout xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
	android:id="id+/LinearLayout1"
	android:orientation="vertical">
	<TextView
		android:id="id+/TextView1"
		android:fontFamily="Arial, Helvetica, Tahoma"
		android:textSize="14px"
		android:textStyle="normal"
		android:textColor="#FFFFFF"
		android:letterSpacing="0.3"
		android:text="@string/entry" />
	<LinearLayout
		android:id="id+/LinearLayout2"
		android:orientation="vertical">
		<GridLayout
			android:id="id+/GridLayout1"
			android:columnCount="2">
			<TextView
				android:id="id+/TextView2"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/order" />
			<EditText
				android:id="@+id/order"
				android:fontFamily="Arial"
				android:textSize="13.3333px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal" />
			<TextView
				android:id="id+/TextView3"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/date_add" />
			<LinearLayout
				android:id="id+/LinearLayout3"
				android:orientation="horizontal">
				<Spinner
					android:id="@+id/month0"
					android:fontFamily="Arial"
					android:textSize="12px"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="normal"
					android:entries="@array/month0_array" />
				<Spinner
					android:id="@+id/day0"
					android:fontFamily="Arial"
					android:textSize="12px"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="normal"
					android:entries="@array/day0_array" />
				<Spinner
					android:id="@+id/year0"
					android:fontFamily="Arial"
					android:textSize="12px"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="normal"
					android:entries="@array/year0_array" />
			</LinearLayout>
			<TextView
				android:id="id+/TextView4"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/time" />
			<ConstraintLayout
				android:id="id+/ConstraintLayout2">
				<Spinner
					android:id="@+id/hour"
					android:fontFamily="Arial"
					android:textSize="12px"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="normal"
					android:entries="@array/hour_array" />
				<Spinner
					android:id="@+id/minute"
					android:fontFamily="Arial"
					android:textSize="12px"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="normal"
					android:entries="@array/minute_array" />
			</ConstraintLayout>
			<TextView
				android:id="id+/TextView5"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/type" />
			<Spinner
				android:id="@+id/typeofentry"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/typeofentry_array" />
			<TextView
				android:id="id+/TextView6"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/topic_add" />
			<LinearLayout
				android:id="id+/LinearLayout4"
				android:orientation="horizontal">
				<EditText
					android:id="@+id/topic0"
					android:fontFamily="Arial"
					android:textSize="13.3333px"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="normal" />
				<Spinner
					android:id="@+id/prominence0"
					android:fontFamily="Arial"
					android:textSize="12px"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="normal"
					android:entries="@array/prominence0_array" />
			</LinearLayout>
			<TextView
				android:id="id+/TextView7"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/series" />
			<Spinner
				android:id="@+id/series"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/series_array" />
			<TextView
				android:id="id+/TextView8"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/subset" />
			<Spinner
				android:id="@+id/subset"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/subset_array" />
			<TextView
				android:id="id+/TextView9"
				android:fontFamily="Arial, Helvetica, Tahoma"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="0.3"
				android:text="@string/active" />
			<Spinner
				android:id="@+id/entryactive"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/entryactive_array" />
		</GridLayout>
		<Button
			android:id="id+/Button1"
			android:text="@string/add" />
	</LinearLayout>
	<GridLayout
		android:id="id+/GridLayout2"
		android:columnCount="4">
		<TextView
			android:id="id+/TextView10"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/series" />
		<Spinner
			android:id="@+id/series"
			android:fontFamily="Arial"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="normal"
			android:entries="@array/series_array"
			android:layout_columnSpan="3" />
		<TextView
			android:id="id+/TextView11"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/subset" />
		<Spinner
			android:id="@+id/subset"
			android:fontFamily="Arial"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="normal"
			android:entries="@array/subset_array"
			android:layout_columnSpan="3" />
		<TextView
			android:id="id+/TextView12"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/entries" />
		<Spinner
			android:id="@+id/entry"
			android:fontFamily="Arial"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="normal" />
		<Button
			android:id="id+/Button3"
			android:text="@string/open" />
		<Button
			android:id="id+/Button4"
			android:text="@string/all" />
		<TextView
			android:id="id+/TextView13"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/mode" />
		<Spinner
			android:id="@+id/mode"
			android:fontFamily="Arial"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="normal"
			android:entries="@array/mode_array"
			android:layout_columnSpan="3" />
		<TextView
			android:id="id+/TextView14"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/style" />
		<Spinner
			android:id="@+id/style"
			android:fontFamily="Arial"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="normal"
			android:entries="@array/style_array"
			android:layout_columnSpan="3" />
		<TextView
			android:id="id+/TextView15"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/calendar" />
		<Spinner
			android:id="@+id/calendar"
			android:fontFamily="Arial"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="normal"
			android:entries="@array/calendar_array"
			android:layout_columnSpan="3" />
		<TextView
			android:id="id+/TextView16"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/version" />
		<ConstraintLayout
			android:id="id+/ConstraintLayout3"
			android:layout_columnSpan="3">
			<Spinner
				android:id="@+id/version"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/version_array" />
			<Spinner
				android:id="@+id/version_update"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/version_update_array" />
			<Button
				android:id="id+/Button5"
				android:text="@string/update" />
		</ConstraintLayout>
		<TextView
			android:id="id+/TextView17"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/branch" />
		<ConstraintLayout
			android:id="id+/ConstraintLayout4"
			android:layout_columnSpan="3">
			<Spinner
				android:id="@+id/branch"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/branch_array" />
			<Spinner
				android:id="@+id/branch_update"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/branch_update_array" />
			<Button
				android:id="id+/Button6"
				android:text="@string/update" />
			<Button
				android:id="id+/Button7"
				android:text="@string/clone" />
		</ConstraintLayout>
		<TextView
			android:id="id+/TextView18"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/custom_add" />
		<LinearLayout
			android:id="id+/LinearLayout5"
			android:orientation="horizontal"
			android:layout_columnSpan="3">
			<EditText
				android:id="@+id/customname0"
				android:fontFamily="Arial"
				android:textSize="13.3333px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal" />
			<Spinner
				android:id="@+id/custommonth0"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/custommonth0_array" />
			<Spinner
				android:id="@+id/customday0"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/customday0_array" />
			<EditText
				android:id="@+id/customyear0"
				android:fontFamily="Arial"
				android:textSize="13.3333px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal" />
		</LinearLayout>
		<TextView
			android:id="id+/TextView19"
			android:fontFamily="Arial, Helvetica, Tahoma"
			android:textSize="12px"
			android:textStyle="normal"
			android:textColor="#000000"
			android:letterSpacing="0.3"
			android:text="@string/conclusion" />
		<ConstraintLayout
			android:id="id+/ConstraintLayout6"
			android:layout_columnSpan="3">
			<Spinner
				android:id="@+id/person"
				android:fontFamily="Arial"
				android:textSize="12px"
				android:textStyle="normal"
				android:textColor="#000000"
				android:letterSpacing="normal"
				android:entries="@array/person_array" />
			<ConstraintLayout
				android:id="id+/ConstraintLayout5">
				<RadioGroup
					android:id="id+/RadioGroup1">
					<RadioButton
						android:id="@+id/c2"
						android:fontFamily="Arial"
						android:text="@string/birth"
						android:textStyle="normal"
						android:textColor="#000000"
						android:letterSpacing="0.3" />
					<RadioButton
						android:id="@+id/c3"
						android:fontFamily="Arial"
						android:text="@string/death"
						android:textStyle="normal"
						android:textColor="#000000"
						android:letterSpacing="0.3" />
				</RadioGroup>
				<CheckBox
					android:id="@+id/c4"
					android:fontFamily="Arial"
					android:text="@string/none"
					android:textStyle="normal"
					android:textColor="#000000"
					android:letterSpacing="0.3" />
			</ConstraintLayout>
			<Button
				android:id="id+/Button8"
				android:text="@string/update" />
		</ConstraintLayout>
	</GridLayout>
</LinearLayout>
```

## auto-generated string resources

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
	<string name="active">Active:</string>
	<string name="add">Add</string>
	<string name="all">All</string>
	<string name="birth">Birth</string>
	<string name="branch">Branch:</string>
	<string name="calendar">Calendar:</string>
	<string name="clone">Clone</string>
	<string name="conclusion">Conclusion:</string>
	<string name="custom_add">Custom (Add):</string>
	<string name="date_add">Date (Add):</string>
	<string name="death">Death</string>
	<string name="entries">Entries:</string>
	<string name="entry">Entry</string>
	<string name="mode">Mode:</string>
	<string name="next">Next</string>
	<string name="no">No</string>
	<string name="none">None</string>
	<string name="open">Open</string>
	<string name="order">Order:</string>
	<string name="predefined">Predefined</string>
	<string name="series">Series:</string>
	<string name="style">Style:</string>
	<string name="subset">Subset:</string>
	<string name="time">Time:</string>
	<string name="topic_add">Topic (Add):</string>
	<string name="type">Type:</string>
	<string name="update">Update</string>
	<string name="variant">Variant</string>
	<string name="version">Version:</string>
	<string name="yes">Yes</string>
</resources>

<?xml version="1.0" encoding="utf-8"?>
<resources>
	<string_array name="branch_array">
		<item>0</item>
		<item>1</item>
		<item>2</item>
		<item>3</item>
		<item>4</item>
		<item>5</item>
		<item>6</item>
		<item>7</item>
		<item>8</item>
		<item>9</item>
		<item>10</item>
	</string_array>
	<string_array name="branch_update_array">
		<item>0</item>
		<item>1</item>
		<item>2</item>
		<item>3</item>
		<item>4</item>
		<item>5</item>
		<item>6</item>
		<item>7</item>
		<item>8</item>
		<item>9</item>
		<item>10</item>
		<item>11</item>
		<item>12</item>
		<item>13</item>
	</string_array>
	<string_array name="calendar_array">
		<item name="1">@string/birth</item>
		<item name="2">@string/death</item>
	</string_array>
	<string_array name="entryactive_array">
		<item name="1">@string/yes</item>
		<item name="0">@string/no</item>
	</string_array>
	<string_array name="mode_array">
		<item name="1">@string/variant</item>
		<item name="2">@string/predefined</item>
	</string_array>
	<string_array name="prominence0_array">
		<item>0</item>
		<item>1</item>
	</string_array>
	<string_array name="year0_array">
		<item>2001</item>
		<item>2002</item>
		<item>2003</item>
		<item>2004</item>
		<item>2005</item>
		<item>2006</item>
		<item>2007</item>
		<item>2008</item>
		<item>2009</item>
		<item>2010</item>
		<item>2011</item>
		<item>2012</item>
		<item>2013</item>
		<item>2014</item>
		<item>2015</item>
		<item>2016</item>
		<item>2017</item>
		<item>2018</item>
	</string_array>
</resources>
```

## user written html

The DIV and FORM tag are not required for mobile devices which in some cases can cause additional Linear layouts to be auto-generated. Most of the android attributes were auto-generated from CSS and were not included with the sample HTML.

```xml
<html>
<head></head>
<body>
<div>
    <h2>Entry</h2>
    <form name="entry" autocomplete="off">
        <ul>
            <li>
                <label>Order:</label>
                <input type="text" name="order" class="null-allowed" />
            </li>
            <li>
                <label>Date (<a href="javascript://">Add</a>):</label>
                <div class="entry-date">
                    <select name="month0"></select>
                    <select name="day0"></select>
                    <select name="year0"></select>
                </div>
            </li>
            <li>
                <label>Time:</label>
                <select name="hour" class="null-allowed"></select>
                <select name="minute"></select>
            </li>
            <li>
                <label>Type:</label>
                <select name="typeofentry"></select>
            </li>
            <li>
                <label>Topic (<a href="javascript://">Add</a>):</label>
                <div class="entry-topic">
                    <input type="text" name="topic0" />
                    <select name="prominence0"></select>
                </div>
            </li>
            <li>
                <label>Series:</label>
                <select name="series"></select>
            </li>
            <li>
                <label>Subset:</label>
                <select name="subset"></select>
            </li>
            <li>
                <label>Active:</label>
                <select name="entryactive"></select>
            </li>
        </ul>
        <br />
        <input type="button" value="Add" />
    </form>
    <br />
    <br />
    <form name="itemofentry" action="/admin/itemofentry" method="post" autocomplete="off">
        <ul>
            <li>
                <label>Series:</label>
                <select name="series" class="req-pageurl-4"></select>
            </li>
            <li>
                <label>Subset:</label>
                <select name="subset" class="req-pageurl-5"></select>
            </li>
            <li>
                <label>Entries:</label>
                <select name="entry" class="req-pageurl-0"></select>
                <input type="button" value="Open" disabled="disabled" target="_blank" />
                <input type="button" value="All" disabled="disabled" target="_blank" />
            </li>
            <li>
                <label>Mode:</label>
                <select name="mode" class="req-pageurl-1"></select>
            </li>
            <li>
                <label>Style:</label>
                <select name="style" class="req-pageurl-2"></select>
            </li>
            <li>
                <label>Calendar:</label>
                <select name="calendar" class="req-pageurl-3"></select>
            </li>
            <li>
                <label>Version:</label>
                <select name="version" class="req-pageurl-6"></select>
                <select name="version_update" class="null-allowed"></select>
                <input type="button" value="Update" />
            </li>
            <li>
                <label>Branch:</label>
                <select name="branch" class="req-pageurl-7"></select>
                <select name="branch_update" class="null-allowed"></select>
                <input type="button" value="Update" />
                <input type="button" value="Clone" />
            </li>
            <li>
                <label>Custom (<a href="javascript://">Add</a>):</label>
                <div class="entry-custom">
                    <input type="text" name="customname0" class="null-allowed" />
                    <select name="custommonth0" class="null-allowed">
                        <option value=""></option>
                        <option value="1">01</option>
                        <option value="2">02</option>
                        <option value="3">03</option>
                        <option value="4">04</option>
                        <option value="5">05</option>
                        <option value="6">06</option>
                        <option value="7">07</option>
                        <option value="8">08</option>
                        <option value="9">09</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                    </select>
                    <select name="customday0" class="null-allowed"></select>
                    <input type="text" name="customyear0" class="null-allowed" />
                </div>
            </li>
            <li>
                <label>Conclusion:</label>
                <select name="person" class="null-allowed"></select>
                <div>
                    <input id="c2" type="radio" name="personbirth" value="1" checked="checked" />
                    <label for="c2">Birth</label>
                    <input id="c3" type="radio" name="personbirth" value="0" />
                    <label for="c3">Death</label>
                    <input id="c4" type="checkbox" name="conclusionnone" value="1" />
                    <label for="c4">None</label>
                </div>
                <input type="button" value="Update" />
            </li>
        </ul>
    </form>
</div>
</body>
</html>
```
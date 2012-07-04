/** 
 * app.js 提供 Sencha SDK Tools 建立 app.jsb3
 */

//啟用 Ext 動態載入器
Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Module': 'modules'
	}
});

Ext.require([
	'Module.SchoolCourse.Package'
]);

//應用程式載入程序
Ext.application({
	name: 'Application',
	launch: function() {
		if (Ext.isFunction(bootstrap)) {
			bootstrap();
		}
	}
});

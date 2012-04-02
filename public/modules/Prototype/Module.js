/**
 * showOnReload: 重新整理網頁後是否重新載入模組
 */
Ext.define('Module.Prototype.Module', {
	init: function() {
	},
    destroy: function() {
    },
	load: function() {
		console.log(this.$className+'.load() undefined');
	},
    unload: function() {
    }
});
/**
 * showOnReload: 重新整理網頁後是否重新載入模組
 */
Ext.define('Module.Prototype.Module', {
	showOnReload: false,
	setShowOnReload: function(boolVal) {
		this.showOnReload = boolVal;
	},
	init: function() {
		if (this.showOnReload) {
			window.location.hash = '#'+this.$className;
		}
	},
	load: function() {
		console.log(this.$className+'.load() undefined');
	}
});
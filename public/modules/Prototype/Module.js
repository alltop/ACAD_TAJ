/**
 * showOnReload: 重新整理網頁後是否重新載入模組
 */
Ext.define('Module.Prototype.Module', {
	moduleInit: function() {
		console.log(this.$className+'.moduleInit() at prototype');
	},
	moduleLoad: function() {
		console.log(this.$className+'.moduleLoad() at prototype');
	},
    moduleUnload: function() {
    	console.log(this.$className+'.moduleUnload() at prototype');
    }
});
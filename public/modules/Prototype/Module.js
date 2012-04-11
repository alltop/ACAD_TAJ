/**
 * showOnReload: 重新整理網頁後是否重新載入模組
 */
Ext.define('Module.Prototype.Module', {
	moduleInit: function() {
		Ext.log(this.$className+'.moduleInit() at prototype');
	},
	moduleLoad: function() {
		Ext.log(this.$className+'.moduleLoad() at prototype');
	},
    moduleUnload: function() {
    	Ext.log(this.$className+'.moduleUnload() at prototype');
    }
});
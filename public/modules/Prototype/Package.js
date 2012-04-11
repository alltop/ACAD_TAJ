/**
 * showOnReload: 重新整理網頁後是否重新載入模組
 */
Ext.define('Module.Prototype.Package', {
	packageInit: function() {
		Ext.log(this.$className+'.packageInit() at prototype');
	},
	requireStore: function(storeClass, storeId) {
		var store = Ext.data.StoreManager.lookup(storeId);
		if (!store) {
			Ext.create(storeClass, {
				storeId: storeId
			});
		}
	}
});
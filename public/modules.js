//啟用 Ext 動態載入器
Ext.Loader.setConfig({
    enabled: true,
    paths: {
        'Module': 'modules'
    }
});

//實作瀏覽器資料快取
Ext.define('ClientSession', { 
    singleton: true,
    user: {},
    mode: '',
    units: [],
    myunits: [],
    blocklist: [],
    blocklist_array: [],
    blockgplist_array: []
});

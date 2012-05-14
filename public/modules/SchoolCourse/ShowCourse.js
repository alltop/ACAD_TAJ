Ext.define('Module.SchoolCourse.ShowCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    title: '我的課程清單',
    layout: 'border',
    bodyStyle: 'padding: 10px',
    autoScroll: true,
    autoLoad: {
        url: 'table.html',
        scripts: false
    }
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.ShowCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;

        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;
        
        var tabpanel = Ext.getCmp('portal-tabpanel');

        //判斷 Panel 是否已經存在 Tab（建立或切換）
        var panel = Module.SchoolCourse.ShowCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.ShowCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.ShowCourse._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        //載入資料
                        //changeFilterHandler('1');
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.ShowCourse._previous = panel;
        }

        //切換到 Panel
        tabpanel.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
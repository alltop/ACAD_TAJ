Ext.define('Module.SchoolCourse.ShowCourseReal.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-ShowCourseReal-Grid1',
    store: 'SchoolCourse-StoreReal4',
    loadMask: true,
    disableSelection: true,
    columnLines: true,
    rowLines: true,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
        }
    },
    columns: {
        items: [
            { header: '節次', dataIndex: 'classno', width: 60, flex: false, align: 'center' },
            { header: '星期一', dataIndex: 'day1' },
            { header: '星期二', dataIndex: 'day2' },
            { header: '星期三', dataIndex: 'day3' },
            { header: '星期四', dataIndex: 'day4' },
            { header: '星期五', dataIndex: 'day5' },
            { header: '星期六', dataIndex: 'day6' },
            { header: '星期日', dataIndex: 'day7' }
        ],
        defaults: {
            tdCls: 'clearlook-grid-cell',
            sortable: false,
            flex: true
        }
    }
});

Ext.define('Module.SchoolCourse.ShowCourseReal.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    title: '我的課程清單',
    layout: 'border',
    /*bodyStyle: 'padding: 10px; background: white',
    autoScroll: true,
    autoLoad: {
        url: 'table.html',
        scripts: false
    }*/
    tbar: [{
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'arrow_rotate_clockwise.png',
        text: '重新整理',
        handler: function(button, e) {
            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal4');
            store4.generateData();
        }
    }, '-',{
                xtype: 'tbtext',
                text: '黑色：配課  <font color="blue">藍色：登記</font>  <font color="red">紅色：即選即上</font>'
    }],
    items: [{
        xtype: 'SchoolCourse-ShowCourseReal-Grid1',
        itemId: 'grid1',
        border: true,
        region: 'center',
        autoHeight: true,
        autoScroll: true
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.ShowCourseReal', {
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
        var panel = Module.SchoolCourse.ShowCourseReal._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.ShowCourseReal.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.ShowCourseReal._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        Ext.defer(function() {
                            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-StoreReal4');
                            store4.generateData();
                        }, 100);
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.ShowCourseReal._previous = panel;
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
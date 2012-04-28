Ext.define('Module.SchoolCourse.UnregisterCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-UnregisterCourse-Grid1',
    store: 'SchoolCourse-Store3',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false
    },
    listeners: {
        render: function(grid) {
            //載入資料
            //grid.body.mask('讀取中');
        }
    },
    columns: [
        {
            header: '退選',
            xtype: 'actioncolumn',
            width: 50,
            hideable: false,
            sortable: false,
            align: 'center',
            items: [{
                icon: __SILK_ICONS_URL+'delete.png',
                text: 'test',
                xtype: 'button',
                tooltip: '加選',
                handler: function(grid, rowIndex, colIndex) {
                    //設定選課來源資料
                    var store1 = grid.getStore();
                    var rec = store1.getAt(rowIndex);
                    //console.log('加選 ' + rec.get('semcourseid'));

                    Ext.MessageBox.confirm(
                        '符合選課條件',
                        '<span class="portal-message">課程：<strong>'+rec.get('semcoursename')+'</strong>已放入候選區！<br/>請按<strong style="color:red">確定加選</strong>按鈕送出所有候選區資料！</span>',
                        function (btn, text) {
                            if (btn=='yes') {
                                //將選課資料移到待選區
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                                store2.add(rec);
                                store1.removeAt(rowIndex);
                            }
                        }
                    );
                }
            }]  
        },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true},
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
        { header: '教師', dataIndex: 'teachername' },
        { header: '星期/節', dataIndex: 'coursetime_view' },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ]
});

Ext.define('Module.SchoolCourse.UnregisterCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    title: '退選 - 全校',
    icon: __SILK_ICONS_URL+'application_view_columns.png',
    layout: 'border',
    tbar: [{
        xtype: 'button',
        icon: __SILK_ICONS_URL+'arrow_rotate_clockwise.png',
        text: '重新讀取',
        handler: function(button, e) {
            Ext.defer(function() {
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                store3.load();
            }, 1);
        }
    }],
    items: [{
        xtype: 'SchoolCourse-UnregisterCourse-Grid1',
        itemId: 'grid1',
        border: true,
        region: 'center',
        autoHeight: true,
        autoScroll: true,
        margins: '5 5 5 5'
    }],
    bbar: [{
        xtype: 'tbtext',
        text: '必修/必選的學分數: 4 選修的學分數: 0'
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.UnregisterCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;
        
        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;

        //載入資料
        Ext.defer(function() {
            var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
            store3.load();
        }, 1);
        
        var content = Ext.getCmp('portal-content');
        //console.log(content);

        //使用新頁籤建立主畫面
        //content.setLoading('讀取中');
        var panel = Ext.create('Module.SchoolCourse.UnregisterCourse.MainPanel', {
            listeners: {
                beforeclose: function() { thisModule.moduleUnload(); }
            }
        });

        //關閉曾經開啟的 Tab
        if (Module.SchoolCourse.UnregisterCourse._previous) {
            content.remove(Module.SchoolCourse.UnregisterCourse._previous);
        }
        Module.SchoolCourse.UnregisterCourse._previous = panel;

        //新增主畫面到 Tab
        content.add(panel);
        content.setActiveTab(panel);
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
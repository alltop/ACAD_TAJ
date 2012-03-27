Ext.define('Module.SchoolCourse.RegisterCourse.Store1', {
    extend: 'Ext.data.Store',
    storeId: 'SchoolCourse-RegisterCourse-Store1',
    autoDestroy: false,
    autoSync: false,
    autoLoad: false,
    fields: ['semcourseid', 'coursetypename', 'semcoursename', 'teachername', 'coursetime_view', 'roomname', 'maxcount', 'selectedcount'],
    proxy: {
        type: 'ajax',
        url: '/service/listall.json',
        reader: {
            type: 'json',
            root: 'results'
        }
    },
    listeners: {
        load: function(store) {
            store.filterBy(function(rec, id) {
                return rec.get('coursetypename') == '通識';
            });
        }
    }
});
Ext.create('Module.SchoolCourse.RegisterCourse.Store1');

Ext.define('Module.SchoolCourse.RegisterCourse.Store2', {
    extend: 'Ext.data.Store',
    storeId: 'SchoolCourse-RegisterCourse-Store2',
    fields: ['semcourseid', 'coursetypename', 'semcoursename', 'teachername', 'coursetime_view', 'roomname', 'maxcount', 'selectedcount'],
    data:{'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'results'
        }
    }
});
Ext.create('Module.SchoolCourse.RegisterCourse.Store2');

var changeFilterHandler = function(val) {
    var store = Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store1');
    store.filterBy(function(rec, id) {
        return rec.get('coursetypename') == val;
    });
};

Ext.define('Module.SchoolCourse.RegisterCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid1',
    store: Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store1'),
    listeners: {
        render: function(grid) {
            //grid.body.mask('讀取中');
            var store = grid.getStore();
            if (!store.count()) {
                Ext.defer(function() {
                    store.load();
                }, 500);
            }
        }
    },
    columns: [
        { 
            header: '加選',
            xtype: 'actioncolumn',
            width: 50,
            sortable: false,
            align: 'center',
            items: [{
                icon: 'images/icons/accept.png',
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
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store2');
                                store2.add(rec);
                                store1.removeAt(rowIndex);
                            }
                        }
                    );
                }
            }]  
        },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120 },
        { header: '教師', dataIndex: 'teachername' },
        { header: '星期/節', dataIndex: 'coursetime_view' },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ],
    tbar: {
        items: [
            {
                xtype: 'button',
                text: '通識選修',
                toggleGroup: 'grid1-filter',
                pressed: true,
                handler: function() {
                    changeFilterHandler('通識');
                    var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                    label.setText('通識選修限制：1.畢業前必須修完五大領域。2.已修過領域不顯示。3.每人只能選一科。');
                }
            },
            {
                xtype: 'button',
                text: '體育選修',
                toggleGroup: 'grid1-filter',
                handler: function() {
                    changeFilterHandler('體育');
                    var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                    label.setText('體育選修...');
                }
            },
            {
                xtype: 'button',
                text: '院訂選修',
                toggleGroup: 'grid1-filter',
                handler: function() {
                    changeFilterHandler('院訂');
                    var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                    label.setText('院訂選修...');
                }
            },
            {
                xtype: 'button',
                text: '軍訓課程',
                toggleGroup: 'grid1-filter',
                handler: function() {
                    changeFilterHandler('軍訓');
                    var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                    label.setText('軍訓課程...');
                }
            },
            {
                xtype: 'button',
                text: '服務教育',
                toggleGroup: 'grid1-filter',
                handler: function() {
                    changeFilterHandler('服務');
                    var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                    label.setText('服務教育...');
                }
            },
            { xtype: 'tbseparator'},
            {
                xtype: 'label',
                text: '最低學分/最高學分：16學分/28學分'
            }
        ]
    },
    bbar: {
        itemId: 'footbar',
        items: [
            {
                xtype: 'label',
                itemId: 'label-status',
                text: '顯示全部',
                cls: 'larger-font'
            }
        ]
    }
});

Ext.define('Module.SchoolCourse.RegisterCourse.Grid2', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid2',
    store: Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store2'),
    columns: [
        { 
            header: '移除',
            xtype: 'actioncolumn',
            width: 50,
            sortable: false,
            align: 'center',
            items: [{
                icon: 'images/icons/cancel.png',
                tooltip: '移除',
                handler: function(grid, rowIndex, colIndex) {
                    //設定選課來源資料
                    var store1 = grid.getStore();
                    var rec = store1.getAt(rowIndex);
                    //console.log('移除 ' + rec.get('semcourseid'));
                    
                    Ext.MessageBox.confirm(
                        '移除候選區課程',
                        '<span class="portal-message">此動作將會移除候選區課程<strong>'+rec.get('semcoursename')+'</strong>！</span>',
                        function (btn, text) {
                            if (btn=='yes') {
                                //將選課資料移到待選區
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store1');
                                store2.add(rec);
                                store1.removeAt(rowIndex);
                            }
                        }
                    );

                }
            }]
        },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1 },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120 },
        { header: '教師', dataIndex: 'teachername' },
        { header: '星期/節', dataIndex: 'coursetime_view' },
        { header: '上課地點', dataIndex: 'roomname' },
        { header: '已選', dataIndex: 'selectedcount', width: 50 },
        { header: '上限', dataIndex: 'maxcount', width: 50 }
    ]
});

Ext.define('Module.SchoolCourse.RegisterCourse.Grid3', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid3',
    store: Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store3'),
    columns: [
        { header: '必修學分數', dataIndex: 'num1', sortable: false },
        { header: '必選的學分數', dataIndex: 'num2', sortable: false },
        { header: '選修的學分數', dataIndex: 'num3', sortable: false },
        { header: '最低學分數', dataIndex: 'num4', sortable: false },
        { header: '最高學分數', dataIndex: 'num5', sortable: false, flex: true }
    ]
});

Ext.define('Module.SchoolCourse.RegisterCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    title: '加選 - 全校',
    layout: 'border',
    items: [
        {
            xtype: 'SchoolCourse-RegisterCourse-Grid1',
            border: true,
            region: 'center',
            autoHeight: true,
            autoScroll: true,
            margins: '5 5 0 5'
        },
        {
            xtype: 'SchoolCourse-RegisterCourse-Grid2',
            border: true,
            resizable: true,
            region: 'south',
            title: '候選區',
            height: 150,
            autoScroll: true,
            margins: '5 5 5 5'
        }
    ],
    buttonAlign: 'left',
    buttons: [
        {
            text: '確定加選',
            handler: function() {
                var store = Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store2');
                store.each(function(rec) {
                    //console.log(rec.get('semcourseid'));
                });
            }
        },
        {
            text: '快速加選',
            handler: function() {

                Ext.Msg.prompt(
                    '加入課程候選區',
                    '<span class="portal-message">請輸入學期課號，將會快速判斷您是否可選這堂課，並放入課程候選區！！<br/>&nbsp;<br/>學期課號：</span>',
                    function(btn, text){
                        if (btn == 'ok'){
                            //設定選課來源資料
                            var store1 = Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store1');
                            var rowIndex = store1.findBy(function(rec, id) {
                                if (rec.get('semcourseid')==text) {
                                    return true;
                                }
                                return false;
                            });

                            if (rowIndex > -1) {
                                var rec = store1.getAt(rowIndex);
                                Ext.Msg.confirm(
                                    '符合選課條件',
                                    '<span class="portal-message">課程：<strong>'+rec.get('semcoursename')+'</strong>已放入候選區！<br/>請按<strong style="color:red">確定加選</strong>按鈕送出所有候選區資料！</span>',
                                    function (btn, text) {
                                        if (btn=='yes') {
                                            //將選課資料移到待選區
                                            var store2 = Ext.data.StoreManager.lookup('SchoolCourse-RegisterCourse-Store2');
                                            store2.add(rec);
                                            store1.removeAt(rowIndex);
                                        }
                                    }
                                );
                            }
                            else {
                                Ext.Msg.alert('沒有符合的課程', '您輸入的學期課號無法找到符合選課條件！');
                            }
                        }
                    }
                );                
            }
        },
        {
            text: '選課結果'
        },
        {
            xtype: 'label',
            text: '必修/必選的學分數: 4 選修的學分數: 0'
        }
    ]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.RegisterCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    constructor: function() {
        this.setShowOnReload(true);
    },
    load: function() {
        var content = Ext.getCmp('portal-content');
        //console.log(content);

        //使用新頁籤建立主畫面
        //content.setLoading('讀取中');
        var panel = Ext.create('Module.SchoolCourse.RegisterCourse.MainPanel');

        //關閉曾經開啟的 Tab
        if (Module.SchoolCourse.RegisterCourse._previous) {
            content.remove(Module.SchoolCourse.RegisterCourse._previous);
        }
        Module.SchoolCourse.RegisterCourse._previous = panel;

        //新增主畫面到 Tab
        content.add(panel);
        content.setActiveTab(panel);
    }
});
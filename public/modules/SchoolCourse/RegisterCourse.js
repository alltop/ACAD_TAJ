var __changeFilterHandler_state = null;
var changeFilterHandler = function(val) {
    if (val==__changeFilterHandler_state) {
        return true;
    }
    if (!val) {
        val = __changeFilterHandler_state;
    }
    __changeFilterHandler_state = val;

    var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
    var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');

    store1.removeAll();

    Ext.defer(function() {
        var result = store0.queryBy(function(record) {
            return (record.get('coursetype')==val);
        });
        store1.loadRecords(result.items);
        store1.sort();
    }, 100);    
};

Ext.define('Module.SchoolCourse.RegisterCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-RegisterCourse-Grid1',
    store: 'SchoolCourse-Store1',
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
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
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
        items: [{
            xtype: 'button',
            text: '通識選修',
            toggleGroup: 'grid1-filter',
            pressed: true,
            handler: function() {
                changeFilterHandler('1');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('通識選修限制：1.畢業前必須修完五大領域。2.已修過領域不顯示。3.每人只能選一科。');
            }
        }, {
            xtype: 'button',
            text: '體育選修',
            toggleGroup: 'grid1-filter',
            handler: function() {
                changeFilterHandler('2');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('體育選修...');
            }
        }, {
            xtype: 'button',
            text: '院訂選修',
            toggleGroup: 'grid1-filter',
            handler: function() {
                changeFilterHandler('3');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('院訂選修...');
            }
        }, {
            xtype: 'button',
            text: '軍訓課程',
            toggleGroup: 'grid1-filter',
            handler: function() {
                changeFilterHandler('4');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('軍訓課程...');
            }
        }, {
            xtype: 'button',
            text: '服務教育',
            toggleGroup: 'grid1-filter',
            handler: function() {
                changeFilterHandler('8');
                var label = this.up('panel').getComponent('footbar').getComponent('label-status');
                label.setText('服務教育...');
            }
        }, { xtype: 'tbseparator'}, {
            xtype: 'label',
            height: 'auto',
            text: '最低學分/最高學分：16學分/28學分'
        }]
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
    store: 'SchoolCourse-Store2',
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
                                var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
                                store2.add(rec);
                                changeFilterHandler();
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
    store: Ext.data.StoreManager.lookup('SchoolCourse-Store3'),
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
            itemId: 'grid1',
            border: true,
            region: 'center',
            autoHeight: true,
            autoScroll: true,
            margins: '5 5 0 5'
        },
        {
            xtype: 'SchoolCourse-RegisterCourse-Grid2',
            itemId: 'grid2',
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
    buttons: [{
        text: '確定加選',
        handler: function() {
            var courses = new Array();

            var store = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
            store.each(function(rec) {
                //console.log(rec.get('semcourseid'));
                courses.push(rec.get('semcourseid'));
            });

            if (courses.length == 0) {
                Ext.Msg.alert('沒有候選課程', '請從待選區選擇要加入候選的課程！');
            }
            else {
                Ext.Msg.wait('正在處理加選...');
                Ext.Ajax.request({
                    url: '/service/selcourse.json/'+ClientSession.sid,
                    method: 'POST',
                    params: {
                        courses: Ext.Array.from(courses).join(',')
                    },
                    success: function(response) {
                        Ext.Msg.hide();

                        var obj = Ext.JSON.decode(response.responseText);

                        Ext.Msg.alert("伺服器回應", response.responseText);
                    }
                });
            }
        }
    }, {
        text: '快速加選',
        handler: function() {
            Ext.Msg.prompt(
                '加入課程候選區',
                '<span class="portal-message">請輸入學期課號，將會快速判斷您是否可選這堂課，並放入課程候選區！！<br/>&nbsp;<br/>學期課號：</span>',
                function(btn, text){
                    if (btn == 'ok'){
                        //設定選課來源資料
                        var store1 = Ext.data.StoreManager.lookup('SchoolCourse-Store1');
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
                                        var store2 = Ext.data.StoreManager.lookup('SchoolCourse-Store2');
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
    }, {
        text: '選課結果'
    }, {
        xtype: 'label',
        height: 10,
        text: '必修/必選的學分數: 4 選修的學分數: 0'
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.RegisterCourse', {
    extend: 'Module.Prototype.Module',
    statics: {
        _previous: null
    },
    moduleLoad: function() {
        var thisModule = this;

        //將目前的模組記錄在 URL HASH
    	window.location.hash = '#'+this.$className;
        
        var content = Ext.getCmp('portal-content');
        //console.log(content);

        //使用新頁籤建立主畫面
        //content.setLoading('讀取中');
        var panel = Ext.create('Module.SchoolCourse.RegisterCourse.MainPanel', {
            listeners: {
                beforeclose: function() { thisModule.moduleUnload(); }
            }
        });

        //關閉曾經開啟的 Tab
        if (Module.SchoolCourse.RegisterCourse._previous) {
            content.remove(Module.SchoolCourse.RegisterCourse._previous);
        }
        Module.SchoolCourse.RegisterCourse._previous = panel;

        //新增主畫面到 Tab
        content.add(panel);
        content.setActiveTab(panel);

        //載入資料
        changeFilterHandler('1');
    },
    moduleUnload: function() {
        //從 URL HASH 移除目前的模組記錄
        if (window.location.hash == '#'+this.$className) {
            window.location.hash = '';
        }
    }
});
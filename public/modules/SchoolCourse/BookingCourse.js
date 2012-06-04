/**
 * 「加選 - 待分發」功能模組
 */
Ext.define('Module.SchoolCourse.BookingCourse.Grid1', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.SchoolCourse-BookingCourse-Grid1',
    store: 'SchoolCourse-Store3',
    loadMask: true,
    disableSelection: false,
    invalidateScrollerOnRefresh: true,
    viewConfig: {
        trackOver: false,
        plugins: {
            ddGroup: 'grid2-group',
            ptype: 'gridviewdragdrop',
            enableDrop: true
        },
        listeners: {
            drop: function(node, data, overModel, dropPosition, eOpts) {
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                store3.generateSerialno();
            }
        }
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
                tooltip: '取消選擇的課程',
                handler: function(grid, rowIndex, colIndex) {
                    //設定選課來源資料
                    var store3 = grid.getStore();
                    var record = store3.getAt(rowIndex);

                    Ext.MessageBox.confirm(
                        '取消確認',
                        '<span class="portal-message">請按「是」取消<strong>'+record.get('semcoursename')+'</strong>課程！</span>',
                        function (btn, text) {
                            if (btn=='yes') {

                                var courses = new Array();
                                courses.push(record.get('semcourseid') + ':' + record.get('courseid'));

                                //將選課資料移到待選區
                                Ext.Msg.wait('正在取消課程...');
                                Ext.Ajax.request({
                                    url: __SERVICE_URL + '/service/cancelcourse.json',
                                    method: 'POST',
                                    params: {
                                        courses: Ext.Array.from(courses).join(',')
                                    },
                                    success: function(response) {
                                        Ext.Msg.hide();
                                        var obj = Ext.JSON.decode(response.responseText);
                                        
                                        //Ext.Msg.alert("伺服器回應", obj.success);

                                        if (obj.success) {
                                            store3.load();
                                        }
                                    }
                                });
                            }
                        }
                    );
                }
            }]  
        },
        { header: '志願順序', dataIndex: 'serialno', width: 60, sortable: false },
        { header: '學期課號', dataIndex: 'semcourseid', width: 120, hidden: true, sortable: false },
        { header: '來源課號', dataIndex: 'courseid', width: 120, hidden: true, sortable: false },
        { header: '課程名稱', dataIndex: 'semcoursename', flex: 1, sortable: false },
		{ header: '學分', dataIndex: 'credit', width: 40, hidden: false},
		{ header: '開課系所', dataIndex: 'unitname', width: 60, hidden: false},
		{ header: '開課班級', dataIndex: 'classname', width: 110, hidden: false},
        { header: '教師', dataIndex: 'teachername', sortable: false },
        { header: '星期/節', dataIndex: 'coursetime_view', sortable: false },
        { header: '上課地點', dataIndex: 'roomname', sortable: false },
        //{ header: '已選', dataIndex: 'selectedcount', width: 50, sortable: false },
		{ header: '級別', dataIndex: 'englevel', width: 40, hidden: true },
        //{ header: '年級', dataIndex: 'grade', width: 50, hidden: true},
        { header: '上限', dataIndex: 'maxcount', width: 50, sortable: false }
    ]
});

Ext.define('Module.SchoolCourse.BookingCourse.MainPanel', {
    extend: 'Ext.Panel',
    frame: false,
    closable: true,
    title: '加選 - 待分發（修改刪除）',
    icon: __SILK_ICONS_URL + 'application_view_columns.png',
    layout: 'border',
    tbar: [{
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'arrow_rotate_clockwise.png',
        text: '重新整理',
        scale: 'medium',
        handler: function(button, e) {
            Ext.defer(function() {
                var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                store3.load();
            }, 1);
        }
    }, {
        xtype: 'button',
        icon: __SILK_ICONS_URL + 'database_save.png',
        text: '<b><font size="3" color="#E68E36">儲存志願排序</font></b>',
        scale: 'medium',
        handler: function(button, e) {
            var courses = new Array();

            var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
            var store4 = Ext.data.StoreManager.lookup('SchoolCourse-Store4');

            store3.each(function(record) {
                courses.push(record.get('semcourseid') + ':' + record.get('courseid') + ':' + record.get('serialno'));
            });

            if (courses.length == 0) {
                Ext.Msg.alert('沒有候選課程', '請從待選區選擇要加入候選的課程！');
            }
            else {
                Ext.Msg.wait('正在儲存志願排序...');
                Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/updateselected.json',
                    method: 'POST',
                    params: {
                        courses: Ext.Array.from(courses).join(',')
                    },
                    success: function(response, opts) {
                        Ext.Msg.hide();

                        var obj = Ext.JSON.decode(response.responseText);

                        //Ext.Msg.alert("伺服器回應", response.responseText);

                        if (obj.success) {
                            store3.load();
                            store4.generateData();

                            Ext.getCmp('notifier').setText('<font color="green">志願排序儲存完成！</font>');
                        }
                        else {
                            Ext.getCmp('notifier').setText('<font color="red">志願排序儲存失敗，請重新操作一次</font>');
                        }
                    },
                    failure: function(response, opts) {
                        Ext.Msg.hide();

                        Ext.Msg.alert("伺服器回應", "無法儲存，請重新再試一次！<br/>" + response.responseText);

                        Ext.getCmp('notifier').setText('<b><font color="red">志願排序儲存失敗</font></b>');
                    }
                });
            }
        }
    }],
    items: [{
        xtype: 'SchoolCourse-BookingCourse-Grid1',
        itemId: 'grid1',
        border: true,
        region: 'center',
        autoHeight: true,
        autoScroll: true
    }],
    bbar: [{
        xtype: 'tbtext',
        text: ''
    }]
});

/**
 * 模組主程式定義區
 */
Ext.define('Module.SchoolCourse.BookingCourse', {
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
        var panel = Module.SchoolCourse.BookingCourse._previous;

        if (!panel) {
            //使用新頁籤建立主畫面
            //tabpanel.setLoading('讀取中');
            var panel = Ext.create('Module.SchoolCourse.BookingCourse.MainPanel', {
                listeners: {
                    beforeclose: function(panel, eOpts) {
                        thisModule.moduleUnload();
                        Module.SchoolCourse.BookingCourse._previous = null;
                    },
                    afterrender: function(panel, eOpts) {
                        //載入資料
                        Ext.defer(function() {
                            var store3 = Ext.data.StoreManager.lookup('SchoolCourse-Store3');
                            store3.load();
                        }, 100);
                    }
                }
            });

            //新增主畫面到 Tab
            tabpanel.add(panel);

            //記錄已建立的新 Panel
            Module.SchoolCourse.BookingCourse._previous = panel;
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
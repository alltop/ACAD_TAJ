Ext.onReady(function() {
    Ext.QuickTips.init();
    var login = new Ext.FormPanel({
        region: 'center',
        url: __SERVICE_URL + '/service/login.json',
        frame: false,
        border: false,
        defaultType: 'textfield',
        monitorValid: true,
        margins: '3 3 3 3',
        bodyStyle: {
            padding: '10px',
            background: 'transparent'
        },
        items: [{
            fieldLabel: '學號',
            labelWidth: 60,
            name: 'studentno',
            allowBlank: false
        }, {
            fieldLabel: '密碼',
            labelWidth: 60,
            name: 'password',
            inputType: 'password',
            allowBlank: false
        }],
        buttons: [{
            xtype: 'button',
            text: '登入',
            cls: 'test',
            icon: __SILK_ICONS_URL + 'application_go.png',
            formBind: true,
            handler: function() {
                login.getForm().submit({
                    method:'POST',
                    waitTitle: '連線中',
                    waitMsg: '正在傳送...',
                    success: function(form, action) {
                        /*
                        Ext.Msg.alert('狀態', '登入成功', function(btn, text) {
                        if (btn == 'ok') {
                            var redirect = 'portal.html';
                            window.location = redirect;
                           }
                        });
                        */

                        //載入主畫面
                        window.location = '/portal';
                    },
                    failure: function(form, action) {
                        if(action.failureType == 'server'){
                            var obj = Ext.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('登入失敗', obj.errors.reason);
                        }else{
                            Ext.Msg.alert('警告', '伺服器發生錯誤: ' + action.response.responseText);
                        }
                        login.getForm().reset();
                    }
                });
            }
        }]
    });
    var win = new Ext.Window({
        title: '選課學生登入',
        icon: __SILK_ICONS_URL + 'user.png',
        layout: 'border',
        width: 480,
        height: 260,
        draggable: false,
        closable: false,
        resizable: false,
        plain: true,
        border: true,
        bodyStyle: {
            padding: '5px',
            background: "#fff url('http://netcc.tajen.edu.tw/pro_course_choose/images/top.jpg') no-repeat"
        },
        items: [{
            xtype: 'panel',
            region: 'north',
            bodyStyle: {
                background: 'transparent'
            },
            border: false,
            height: 100
        }, {
            xtype: 'panel',
            region: 'west',
            bodyStyle: {
                background: 'transparent'
            },
            border: false,
            width: 250
        }, login],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            border: false,
            bodyStyle: {
                padding: '5px',
                background: 'transparent'
            },
            items: ['© ALLTOP 2012', '-','DEMO ID: 400111073']
        }]
    });
    win.show();
});
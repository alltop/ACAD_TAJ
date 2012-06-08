Ext.onReady(function() {
    var mode = 'realtime';
	var admin = '';
    var modeText = '';
    var urlparams = document.URL.split("?");
    if (urlparams.length > 1) {
        var params = Ext.urlDecode(urlparams[1]);
		
        if (params && params.mode) {
            mode = params.mode;
			admin = params.admin;
        }
    }

    switch (mode) {
        case 'select':
            modeText = '登記分發';
        break;
        case 'realtime':
            modeText = '即選即上';
        break;
    }

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
        }, {
            xtype: 'hidden',
            name: 'mode',
            value: mode
        }, {
            xtype: 'hidden',
            name: 'admin',
            value: admin
        }],
        buttons: [{
            xtype: 'button',
            text: '登入',
            scale: 'medium',
            cls: 'test',
            icon: __SILK_ICONS_URL + 'application_go.png',
            formBind: true,
            handler: function() {
				//手動調整 mode == 'realtime' 不能進入選課系統
				//if(mode == 'realtime') {
				if(false) {
					alert('非選課時段，請於選課時段重新登入。');
					window.location = '/login';
				} else {	
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
            }
        }]
    });
    var win = new Ext.Window({
        title: '選課學生登入',
        icon: __SILK_ICONS_URL + 'user.png',
        layout: 'border',
        width: 480,
        height: 300,
        draggable: false,
        closable: false,
        resizable: false,
        plain: true,
        border: true,
        bodyStyle: {
            padding: '5px',
            background: "#fff url('./images/top.jpg') no-repeat"
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
            hidden: !Ext.isIE,
            bodyStyle: {
                padding: '5px',
                background: 'transparent'
            },
            items: [
                {xtype: 'tbfill'},
                {
                    xtype: 'button',
                    text: '<font color="red" size="2">IE瀏覽器版本過低（8以下）請先升級瀏覽器</font>',
                    hidden: !Ext.isIE,
                    handler: function() {
                        location.href = '/chrome';
                    }
                }
            ]
        }, {
            xtype: 'toolbar',
            dock: 'bottom',
            border: false,
            bodyStyle: {
                padding: '5px',
                background: 'transparent'
            },
            items: [
                //'© ALLTOP 2012',
                {
                    xtype: 'button',
                    text: '即選即上',
                    handler: function() {
                        location.href = '/realtime';
                    }
                },
                {
                    xtype: 'button',
                    text: '登記分發',
                    handler: function() {
                        location.href = '/select';
                    }
                },
                {xtype: 'tbfill'},
                {
                    xtype: 'button',
                    text: '<font color="blue">手動更新瀏覽器</font>',
                    handler: function() {
                        location.href = 'http://www.google.com/chromeframe?hl=zh-TW&quickenable=true';
                    }
                },
                '選課模式: <font color="blue" size="3"><b>' + modeText + '</b></font>'
            ]
        }]
    });
    

    if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
        Ext.Msg.confirm('重要：瀏覽器升級提示', '系統偵測到您的 Internet Explorer 瀏覽器核心可以升級，<br/>您是否願意立即升級至速度更快、更安全的版本？<br/><br/>請按「<b>是</b>」開始 Google Chrome Frame 升級程序！！！', function (btn, text) {
            if (btn=='yes') {
                location.href = '/chrome';
            }
            else {
                win.show();
            }
        });
    }
    else {
        win.show();
    }

});
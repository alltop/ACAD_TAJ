Ext.onReady(function(){
    Ext.QuickTips.init();
    var login = new Ext.FormPanel({
        labelWidth:80,
        url: '/service/login.json',
        frame: false,
        border: false,
        defaultType: 'textfield',
	    monitorValid: true,
        items:[{
            fieldLabel: '學號',
            name: 'studentno',
            allowBlank:false
        },{
            fieldLabel: '密碼',
            name: 'password',
            inputType: 'password',
            allowBlank: false
        }],
        buttons:[{
            text: '登入',
            formBind: true,
            handler: function() {
                login.getForm().submit({
                    method:'POST',
                    waitTitle: '連線中',
                    waitMsg: '正在傳送...',
                    success: function(){
                    	Ext.Msg.alert('狀態', '登入成功', function(btn, text) {
        		        if (btn == 'ok') {
                            var redirect = 'portal.html';
                            window.location = redirect;
                           }
    			        });
                    },
                    failure: function(form, action) {
                        if(action.failureType == 'server'){
                            obj = Ext.JSON.decode(action.response.responseText);
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
        layout: 'fit',
        width: 300,
        height: 150,
        closable: false,
        resizable: false,
        plain: true,
        border: false,
        items: [login]
	});
	win.show();
});
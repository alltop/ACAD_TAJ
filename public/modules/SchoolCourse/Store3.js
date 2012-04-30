Ext.define('Module.SchoolCourse.Store3', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: ['semcourseid', 'courseid', 'coursetype', 'coursetypename', 'semcoursename', 'teachername', 'coursetime', 'coursetime_view', 'roomname', 'maxcount', 'selectedcount'],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'results'
        }
    },
    listeners: {
        load: function(store3, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0) {
                var request = Ext.Ajax.request({
                    url: '/service/listselected.json/'+ClientSession.sid,
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);
                        var result = store0.queryBy(function(record) {
                            return Ext.Array.contains(obj, record.get('semcourseid'));
                        });
                        store3.loadRecords(result.items);
                    }
                });
            }
        }
    }
});

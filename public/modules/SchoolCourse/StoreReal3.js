/**
 * 已選課程資料來源（退選用）
 */
Ext.define('Module.SchoolCourse.StoreReal3', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'serialno', 'credit', 'unitname'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    listeners: {
        load: function(StoreReal3, records, options) {
            var store0 = Ext.data.StoreManager.lookup('SchoolCourse-Store0');
            if (store0 && store0.count() > 0) {
                var request = Ext.Ajax.request({
                    url: __SERVICE_URL + '/service/listselectedReal.json',
                    method: 'GET',
                    success: function(response) {
                        var obj = Ext.JSON.decode(response.responseText);

                        var semcourseid_array = new Array();

                        Ext.Array.each(obj, function(item) {
                            var tokens = item.split(':');
                            semcourseid_array.push(tokens[0]);
                        });


                        var records = new Array();

                        store0.each(function(record) {
                            if (Ext.Array.contains(semcourseid_array, record.get('semcourseid'))) {
                                records.push(record);
                            }
                        });
                        StoreReal3.loadRecords(records);

                        StoreReal3.sort([
                            {property: 'semcoursename', direction: 'ASC'},
                        ]);
                    }
                });
            }
        }
    }
});

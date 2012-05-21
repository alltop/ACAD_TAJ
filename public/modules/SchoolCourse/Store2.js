Ext.define('Module.SchoolCourse.Store2', {
    extend: 'Ext.data.Store',
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount', 'choose', 'grade',
        'unitid', 'collegeid', 'studytype', 'selectgpid', 'englevel',
        'seqno'
    ],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    /**
     * 產生志願順序
     */
    generateSeqno: function() {
        var store2 = this;
        store2.each(function(record) {
            var record_index = store2.indexOf(record);
            var record_semcoursename = record.get('semcoursename');
            var result = store2.queryBy(function(record2) {
                if (store2.indexOf(record2) >= record_index) return false;
                return (record2.get('semcoursename')==record_semcoursename);
            });
            record.set('seqno', result.items.length + 1);
        });
    }
});

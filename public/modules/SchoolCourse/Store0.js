Ext.define('Module.SchoolCourse.Store0', {
    extend: 'Ext.data.Store',
    autoSync: false,
    autoLoad: false,
    buffered: false,
    purgePageCount: 0,
    fields: [
        'semcourseid', 'courseid', 'coursetype', 'coursetypename',
        'semcoursename', 'teachername', 'coursetime', 'coursetime_view',
        'roomname', 'maxcount', 'selectedcount',
        'unitid', 'collegeid', 'studytype'
    ],
    proxy: {
        type: 'ajax',
        url: __SERVICE_URL + '/service/cached/listall.json',
        method: 'GET',
        noCache: false,
        reader: {
            type: 'array'
        }
    }
});
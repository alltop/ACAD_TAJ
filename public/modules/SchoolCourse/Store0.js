Ext.define('Module.SchoolCourse.Store0', {
    extend: 'Ext.data.Store',
    autoDestroy: false,
    autoSync: false,
    autoLoad: false,
    buffered: false,
    purgePageCount: 0,
    fields: ['semcourseid', 'coursetype', 'coursetypename', 'semcoursename', 'teachername', 'coursetime_view', 'roomname', 'maxcount', 'selectedcount'],
    sorters: [{
        property : 'semcourseid',
        direction: 'DESC'
    }],
    proxy: {
        type: 'ajax',
        url: '/service/listall.json',
        method: 'GET',
        reader: {
            type: 'array'
        }
    }
});
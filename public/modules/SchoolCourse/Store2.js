Ext.define('Module.SchoolCourse.Store2', {
    extend: 'Ext.data.Store',
    storeId: 'SchoolCourse-RegisterCourse-Store2',
    fields: ['semcourseid', 'coursetype', 'coursetypename', 'semcoursename', 'teachername', 'coursetime_view', 'roomname', 'maxcount', 'selectedcount'],
    data: {'items':[]},
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'results'
        }
    }
});

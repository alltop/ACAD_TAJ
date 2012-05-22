/**
 * 我的課程清單
 */
Ext.define('Module.SchoolCourse.Store4', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    autoSync: false,
    fields: [
        'classno', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'
    ],
    data: {
        items: [
            { classno: 1, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 2, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 3, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 4, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 5, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 6, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 7, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 8, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 9, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 10, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 11, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 12, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 13, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { classno: 14, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' }
        ]
    },
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    generateData: function() {
        var store4 = this;
        var store5 = Ext.data.StoreManager.lookup('SchoolCourse-Store5');
        store5.load({
            callback: function(records, operation, success) {
                Ext.defer(function() {
                    store4.each(function(record) {
                        var classno = record.get('classno');

                        var class_array = new Array();
                        class_array[0] = '';
                        class_array[1] = '';
                        class_array[2] = '';
                        class_array[3] = '';
                        class_array[4] = '';
                        class_array[5] = '';
                        class_array[6] = '';

                        store5.each(function(record2) {
                            var record2_coursetime = record2.get('coursetime');
                            var coursetime_array = record2_coursetime.split(',');

                            Ext.Array.each(coursetime_array, function(coursetime) {
                                var the_classno = coursetime % 100;
                                var index = (coursetime - the_classno) / 100 - 1;

                                if (classno == the_classno) {
                                    class_array[index] = class_array[index] + record2.get('semcoursename') + '<br/>';
                                }
                            });
                        });

                        for (var i = 0; i < 7; i++) {
                            var the_day = 'day' + (i+1);
                            record.set(the_day, class_array[i]);
                        }
                    });

                    store4.commitChanges();
                }, 2000);
            }
        });
    }
});

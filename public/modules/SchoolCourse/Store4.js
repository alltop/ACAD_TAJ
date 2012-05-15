/**
 * 我的課程清單
 */
Ext.define('Module.SchoolCourse.Store4', {
    extend: 'Ext.data.Store',
    autoLoad: true,
    autoSync: false,
    fields: [
        'seqno', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'
    ],
    data: {
        results: [
            { seqno: 1, day1: '', day2: '英文II', day3: '', day4: '', day5: 'VHDL設計實務<br/>英文II', day6: '', day7: '' },
            { seqno: 2, day1: '', day2: '英文II', day3: '3D動畫基礎', day4: '', day5: 'VHDL設計實務<br/>英文II', day6: '', day7: '' },
            { seqno: 3, day1: '', day2: '營養學及實驗', day3: '3D動畫基礎', day4: '營養學I', day5: 'VHDL設計實務<br/>英文II', day6: '', day7: '' },
            { seqno: 4, day1: '', day2: '營養學及實驗', day3: '3D動畫基礎', day4: '營養學I', day5: 'VHDL設計實務<br/>英文II', day6: '', day7: '' },
            { seqno: 5, day1: '人文-世異各國文化教育<br/>社會-國際關係', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { seqno: 6, day1: '人文-世異各國文化教育<br/>社會-國際關係', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { seqno: 7, day1: '', day2: '健身', day3: '', day4: '', day5: '', day6: '', day7: '勞動教育I' },
            { seqno: 8, day1: '', day2: '健身', day3: '', day4: '', day5: '', day6: '', day7: '勞動教育I' },
            { seqno: 9, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { seqno: 10, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { seqno: 11, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { seqno: 12, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { seqno: 13, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' },
            { seqno: 14, day1: '', day2: '', day3: '', day4: '', day5: '', day6: '', day7: '' }
        ]
    },
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'results'
        }
    }
});

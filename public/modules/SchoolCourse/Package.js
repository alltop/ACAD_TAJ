/**
 * Package Manager
 */
Ext.define('Module.SchoolCourse.Package', {
	extend: 'Module.Prototype.Package',
	requires: [
		'Module.SchoolCourse.Store0',
		'Module.SchoolCourse.Store1',
		'Module.SchoolCourse.Store1a',
		'Module.SchoolCourse.Store2',
		'Module.SchoolCourse.Store3',
		'Module.SchoolCourse.Store4',
		'Module.SchoolCourse.Store5',
		'Module.SchoolCourse.StoreReal1',
		'Module.SchoolCourse.StoreReal1a',
		'Module.SchoolCourse.StoreReal2',
		'Module.SchoolCourse.StoreReal3',
		'Module.SchoolCourse.StoreReal4',
		'Module.SchoolCourse.StoreReal5',
		'Module.SchoolCourse.BookingCourse',
		'Module.SchoolCourse.RealtimeCourse',
		'Module.SchoolCourse.RegisterCourse',
		'Module.SchoolCourse.ShowCourse',
		'Module.SchoolCourse.ShowCourseReal',
		'Module.SchoolCourse.UnregisterCourse'
	],
	packageInit: function() {
		this.requireStore('Module.SchoolCourse.Store0', 'SchoolCourse-Store0');
		this.requireStore('Module.SchoolCourse.Store1', 'SchoolCourse-Store1');
		this.requireStore('Module.SchoolCourse.Store1a', 'SchoolCourse-Store1a');
		this.requireStore('Module.SchoolCourse.Store2', 'SchoolCourse-Store2');
		this.requireStore('Module.SchoolCourse.Store3', 'SchoolCourse-Store3');
		this.requireStore('Module.SchoolCourse.Store4', 'SchoolCourse-Store4');
		this.requireStore('Module.SchoolCourse.Store5', 'SchoolCourse-Store5');
		this.requireStore('Module.SchoolCourse.StoreReal1', 'SchoolCourse-StoreReal1'); //即選即上_加選區
		this.requireStore('Module.SchoolCourse.StoreReal1a', 'SchoolCourse-StoreReal1a'); //即選即上_加選區左側
		this.requireStore('Module.SchoolCourse.StoreReal2', 'SchoolCourse-StoreReal2'); //即選即上_候選
		this.requireStore('Module.SchoolCourse.StoreReal3', 'SchoolCourse-StoreReal3'); //即選即上_退選區
		this.requireStore('Module.SchoolCourse.StoreReal4', 'SchoolCourse-StoreReal4'); //即選即上_課表
		this.requireStore('Module.SchoolCourse.StoreReal5', 'SchoolCourse-StoreReal5'); //即選即上_已選課程
	}
});
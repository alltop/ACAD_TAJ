
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.redirect('/portal.html');
	//res.render('index', { title: 'redirect to portal' });
};

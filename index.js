var nodegit = require('nodegit')
var path = require('path')
var fs = require('fs')

var all = []

var git_data = []

var cnt = 0;

//var export_path = 'export/';
var export_path = '/Users/gauthiier/Desktop/vbox/reckon_export/export';
var export_index_fname = 'index.json';
var export_index = null;

var template = '';

var imgs_list_ext_valid = ['.png', '.jpeg', '.jpg', '.gif']

fs.readFile('template.html', 'utf8', function(err, data) {
	if(err) console.log(err);
	template = data;
});

// hmm...
var export_index_path = path.join(export_path, export_index_fname);
if(fs.existsSync(export_index_path))
	export_index = JSON.parse(fs.readFileSync(export_index_path, 'utf8'));

nodegit.Repository.open(path.resolve(__dirname, './.git'))
	.then(function(repo) {
		return repo.getBranchCommit('prototype');
	})
	.then(function(first_commit) {
		var history = first_commit.history(nodegit.Revwalk.SORT.REVERSE);
		//var history = first_commit.history(nodegit.Revwalk.SORT.TIME);

		history.on("commit", function(commit) {

			var entry = {};

      entry.commit = commit.sha();
      entry.author = commit.author().name();
      entry.date = commit.date();    
      entry.raw = commit.rawHeader(); 
      entry.message = commit.message().replace('\n', ' — ');
      entry.files = [];


      commit.getTree()
      	.then(function (tree) {
        	var entries = tree.entries();

        	for(e in entries) {
            var ep = entries[e].path();
            if(all.indexOf(ep) != -1) continue;
            all.push(ep);
            entry.files.push(ep);
        	}

			});

			git_data.push(entry);

		});

    history.on("end", function() {
    	var body = '';
    	git_data.reverse();
			for(var i in git_data)
				body += emit_git_entry(git_data[i]);
			console.log(template.replace('[[_export_]]', body));
    });

		history.start();            

	})
	.done();

function emit_git_entry(entry) {

	var html = '<!-- entry #' + cnt++ + ' -->\n';

	html += '<entry>\n'

	html += '	<commit><h1>Commit: ' + entry.commit + '</h1></commit>\n';

	html += '	<commit>' + entry.date + '</commit>\n';

	html += '	<message><h2>' + entry.message + '</h2></message>\n';

	html += '	<content>\n';

	for(var q in entry.files) {
		html += '		' + emit_git_content(entry.files[q]);
	}

	html += '	</content>\n';

	return html + '</entry>\n'
}

function emit_git_content(c) {


	if(!fs.existsSync(path.join('.', c))) return '';
	if(!fs.statSync(path.join('.', c)).isFile()) return '';

	var ext = path.extname(c);

	if(imgs_list_ext_valid.indexOf(ext) != -1) 
		return '<a href="' + c + '"><img src="' + c + '"/></a>\n';
	else if(ext === '.pdf') {
		return '<a href="' + c + '">' + emit_git_content_pdf(c) + '</a>';
	} else {
		return '<a href="' + c + '">' + c + '</a>\n';
	}

}

function emit_git_content_pdf(c) {

	var index = exists(c);	
	if(!index) return '';

	return '<img src="' + path.join(export_path, index.imgs[0]) + '"/>\n';

}

/// hmmm....
function exists(fname) {

	if(!export_index) return null;
	for (var e in export_index) {
		if(export_index[e].name === fname)
			return export_index[e];
	}
	return null;
}

      
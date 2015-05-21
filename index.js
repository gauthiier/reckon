var nodegit = require('nodegit')
var path = require('path')

nodegit.Repository.open(path.resolve(__dirname, './.git'))
	.then(function(repo) {
		return repo.getBranchCommit('prototype');
	})
	.then(function(first_commit) {
		var history = first_commit.history(nodegit.Revwalk.SORT.Time);

		history.on("commit", function(commit) {
			console.log("commit " + commit.sha());
      console.log("Author:", commit.author().name() +
        " <" + commit.author().email() + ">");
      console.log("Date:", commit.date());
      console.log("\n    " + commit.message());

      commit.getTree()
      	.then(function (tree) {
      		var entries = tree.entries();

      		// look at diffs here -- as entries grows and does not specify the *specific* entries of this commit

      		for(e in entries) {
      			console.log(entries[e].path());	
      		}
      		
      	});
      
		});

		history.start();

	})
	.done();
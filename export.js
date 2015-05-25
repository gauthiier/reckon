var fs = require('fs')
var gs = require('ghostscript')
var path = require('path')

var reckon_path = "."
var export_path = "export"
var index_name = "index.json"

if(!fs.existsSync(export_path))
	fs.mkdirSync(export_path);

var index = [];
var index_path = path.join(export_path, index_name);
if(fs.existsSync(index_path))
	index = JSON.parse(fs.readFileSync(index_path, 'utf8'));


fs.readdir(reckon_path, function(err, files) {
	if(err)
		throw err;
	files.map(function (f) {
		return {"name" : f, "path" : path.join(reckon_path, f)};
	}).filter(function (f) {
			return (fs.statSync(f.path).isFile() && path.extname(f.path) === '.pdf' && !exists(f.name));		
	}).forEach(function (f) {
		var img_fname = extract_img(f.path);
		var entry = {}		
		entry.name = f.name;
		entry.imgs = [];
		entry.imgs.push(img_fname);
		index.push(entry);
	})

	var index_content = JSON.stringify(index, null, 2);
	fs.writeFile(index_path, index_content, function(err) {
		if(err) return console.log(err);
		console.log(index_path + '>' + index_content);
	}); 
	
});



function extract_img(file) {

	var out_name = path.basename(file) + ".png"
	var out = path.join(export_path, out_name);
	
	gs()
  .batch()
  .quiet()
  .nopause()
  .device('pngalpha')
  .input(file)
  .output(out)
  .r(72)
  .spawn();

  return out_name;

}

function exists(fname) {
	for (var e in index) {
		if(index[e].name === fname)
			return true;
	}
	return false;
}

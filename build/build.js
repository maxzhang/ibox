var pkg = require('../package.json'),
    fs = require('fs'),
    hint = require('jshint').JSHINT,
    uglify = require('uglify-js2');

var banner = '/*! iBox v' + pkg.version + ' ~ (c) ' + (new Date().getFullYear()) + ' Max Zhang, https://github.com/maxzhang/ibox2 */\n',
    files = ['klass.js', 'utils.js', 'ibox.js', 'view.js', 'header.js', 'generalheader.js'];

console.log('Building release: iBox v' + pkg.version);
build();

function build() {
    var out = banner + files.map(function(filePath) {
        return fs.readFileSync('../src/' + filePath, 'utf-8');
    }).join('\n');

    out = out.replace(/\{@VERSION\}/g, pkg.version);

    if (!hint(out)) {
        var lines = out.split('\n');
        hint.errors.forEach(function(err) {
            console.log('\033[31m[' + err.code + ']\033[0m ' + err.line + ':' + err.character + '\t- ' + err.reason);
            console.log('\033[33m' + lines[err.line - 1].replace(/\t/g, ' ') + '\033[0m\n');
        });
        process.exit();
    }

    fs.writeFileSync('../ibox.js', out);

    out = uglify.minify(out, { fromString: true });
    fs.writeFileSync('../ibox.min.js', banner + out.code);

    console.log('Built completed!');
}
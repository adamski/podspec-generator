var jsonfile = require('jsonfile')
var path = require('path')
var fs = require('fs')
var argv = require('minimist')(process.argv.slice(2), {
  string: 'ios',
  boolean: 'dry'
})
var resolve = require('path-resolve')
var changeCase = require('change-case')
var addrs = require("email-addresses")

var file = 'package.json'
var iosVersion = argv.ios || '8.0'
var iosFolder = argv.source_files || 'ios'
var dry = argv.dry || false
var modulePaths = []

if (argv._.length === 0) { // Assume we are in the package folder
  // modulePaths.push(path.resolve("./"))
  modulePaths.push(path.resolve("./"))
} else {
  argv._.forEach(function(packageFolder) {
    var absolutePath = resolve(packageFolder)
    if (checkDirectorySync(absolutePath)) 
      modulePaths.push(absolutePath)
    else 
      console.error("Directory not found: " + absolutePath)
  })
}

modulePaths.forEach(function(modulePath) {
  var packageFilePath = modulePath+'/'+file

  jsonfile.readFile(packageFilePath, function(err, pkg) {
    console.dir(pkg)
    
    var author
    if(typeof pkg.author === 'string') {
      author = addrs.parseOneAddress(pkg.author) 
    } else {
      author = pkg.author
      author.address = author.email
    }
    var name = changeCase.pascalCase(pkg.name)
    var user = (pkg._npmUser ? pkg._npmUser.name : '')
    // Assume Git! 
    var repo = (pkg.repository && pkg.repository.url) || 'https://www.github.com/'+user+'/'+pkg.name
    repo = repo.replace("git+","")

    var podspecString = 'Pod::Spec.new do |s|\n' +
    '  s.name         = "' + name + '"\n' +
    '  s.version      = "' + pkg.version + '"\n' +
    '  s.summary      = "' + (pkg.description || '') + '"\n' +
    '  s.homepage     = "' + (pkg.homepage || repo) + '"\n' +
    '  s.license      = { :type => "' + (pkg.license || '') + '" }\n' +
    '  s.authors      = { "' + author.name + '" => "' + (author.address || '') + '" }\n' +
    '  s.platform     = :ios, "' + iosVersion + '"\n' +
    '  s.source       = { :path => "." }\n' +
    '  s.source_files = "ios", "' + iosFolder + '/**/*.{h,m}"\n' +
    'end'
    console.log(podspecString)
    if (! dry) {
      fs.writeFile(modulePath + '/' + name + '.podspec', podspecString, (err) => {
        if (err) throw err;
        console.log('Saved podspec for '+pkg.name)
      })
    }
  })
})

function checkDirectorySync(directory) {  
  try {
    fs.statSync(directory)
  } catch(e) {
    return false
  }
  return true

}

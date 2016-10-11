# podspec-generator
Automatic podspec generator based on a module's package.json, for React Native modules on iOS.

## Install 
`npm install -g podspec-generator` 

## Usage
`podspec-generator path/to/module`

### Options

`ios`: Set ios target version e.g. `7.0`. Defaults to `8.0`

`source_files`: Set source folder. Defaults to `ios`

`dry`: Perform a dry-run and log output (don't generate the file)

Example:

`podspec-generator path/to/module --ios=7.0 --source_files=Classes`




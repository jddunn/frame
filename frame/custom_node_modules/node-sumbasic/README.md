# node-sumbasic
Implementation of SumBasic on NodeJS.

Sumbasic is a popular baseline method for document summarization. The explanation could be read from the original paper: Nenkova, A. and Vanderwende, L., 2005. The impact of frequency on summarization. Microsoft Research, Redmond, Washington, Tech. Rep. MSR-TR-2005, 101.

Here, the SumBasic are created as module inside `./src/index.js`.

### NPM package ###
- Run `npm install node-sumbasic --save`
- Require it in your project `const sumBasic = require('node-sumbasic')`
- Call it `sumBasic(documents, target_summary_length, minimum_sentence_length_considered [optional])`
- Example `sumBasic(documents, 100)`

### Demo run in project folder ###
- Make sure to install the npm modules first `npm install`
- In the project, run `node ./src/demo.js`

### What's new ###

0.1.7
- Change dependencies from natural to stemmer
- Add minimum sentence length to the optional parameter



# Contributing

Pull requests are welcome. Here is a quick guide on how to start.

## Setup

Fork, then clone the repository :

    git clone git@github.com:{your-username}/vast-client-js.git

Setup your environment :

    cd vast-client-js && npm install

Run the tests :

    npm test

Bundle the scripts :

    npm run-script bundle

## Pull requests Guidelines

 - Use [EditorConfig](http://editorconfig.org/) or at least stay consistent to the file formats defined in the `.editorconfig` file.
 - Develop in a topic branch, not master
 - Make sure test-suite passes: `npm test`
 - Add relevant tests to cover the change
 - Don't commit the updated `vast-client.js` file in your PR. We'll take care of generating an updated build right before releasing a new tagged version.

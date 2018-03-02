# Contributing

Pull requests are welcome. Here is a quick guide on how to start.

## Setup

Fork, then clone the repository :

    git clone git@github.com:{your-username}/vast-client-js.git

Setup your environment :

    cd vast-client-js && npm install

Run the tests :

    npm test

### Bundle

The project uses webpack to bundle the assets, currently two bundling modes are supported :
 - development
 - production

To bundle the assets for development (output will be `vast-client.js`):

    npm run dev

To bundle the assets for production (output will be `vast-client.min.js`):

    npm run build

## Pull requests Guidelines

 - Use [EditorConfig](http://editorconfig.org/) or at least stay consistent to the file formats defined in the `.editorconfig` file.
 - Develop in a topic branch, not master
 - Make sure test-suite passes: `npm test`
 - Add relevant tests to cover the change
 - Don't commit the updated `vast-client.js` file in your PR. We'll take care of generating an updated build right before releasing a new tagged version.

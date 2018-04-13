# Contributing

:tada: Thanks for being here :tada:

We appreciate any kind of contribution: bug reports, feature requests and pull requests.

Please read the following sections before making your contribution.

## Report a bug / Request a feature
To report a bug or request a feature, please [create an issue on GitHub](https://github.com/dailymotion/vast-client-js/issues/new) and follow the guidelines below.

### Report a bug
 * Explain the expected behaviour with a simple sentence
 * Label the issue as a `bug`
 * Provide the **steps** to reproduce your problem (if possible) or a simple **example** of code
 * Report the **version** of the library you are using
 * Is it a regression from a previous version?

### Request a feature or suggest an enhancement
If you see something that's missing or can be improved, please let us know!

 * Explain which feature/improvement you would like to be added to the library.
 * Label the issue as `feature`, `enhancement` or `discussion`
 * If you can, suggest how you would do that :sunglasses:
 * If you already coded it, feel free to open and link a pull request :man_technologist: :woman_technologist:

## Pull requests
Pull requests are welcome. Here is a quick guide on how to start.

 * Develop in a dedicated branch, not directly on master
 * If you add some logic, add some tests too
 * Make sure test are passing (`npm test`)
 * If you bundle the project, please don't commit the updated `vast-client.js` file in your PR. We'll take care of generating an updated build right before releasing a new tagged version.

## Setup the project

Clone the repository :
```Bash
git clone git@github.com:dailymotion/vast-client-js.git
```

Setup your environment :
```Bash
cd vast-client-js

npm install
```

Run the tests :
```Bash
npm test
```

### Bundle

The project uses webpack to bundle the assets (output will be `vast-client.js`):
```Bash
npm run build
```

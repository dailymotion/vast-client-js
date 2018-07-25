# Release tasks

This document describes release tasks used during the project life-cycle.
We might want to automate some of them in a near future (e.g via Travis).
For now, let's use this document to make sure everyone is on the same page.

## Release a new version

``` Bash
git checkout master
npm test
npm run build
git add . && git commit -m "Bundle release [release version number]"
npm version <major|minor|patch> # depending on the changes
npm publish
git push --tags origin master
```

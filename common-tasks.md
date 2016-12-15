# Common tasks

This document describes common tasks used during the project life-cycle (mostly release-related).
We might want to automate some of them in a near future (e.g via Travis).
For now, let's use this document to make sure everyone is on the same page.

## Release a new version

``` bash
git checkout master
npm run test
npm run bundle
git add . && git commit -m "Bundle last changes"
npm version <major|minor|patch> # depending on the changes
npm publish
git push --tags origin master
```

## Release a new alpha version :

``` bash
git checkout v2.x
npm run test
npm run bundle
git add . && git commit -m "Bundle last changes"
npm version prerelease
npm publish --tag alpha
git push --tags origin v2.x
```

## Merge the latest version back into the v2.x branch

``` bash
# assuming 1.6.0 tag exists and is the latest
git checkout -b merge-1.6.0-into-v2.x
git merge 1.6.0
# fix conflicts then git add conflicting files
npm run test
git commit
git push origin merge-1.6.0-into-v2.x
# Create PR on Github (based on `v2.x` branch)
```

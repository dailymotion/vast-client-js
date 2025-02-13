#!/bin/bash

set -e

RELEASE_VERSION=$1
VERSION_TYPE=$2

  if [[ -z "$RELEASE_VERSION" || -z "$VERSION_TYPE" ]]; then
    echo "Error: Missing version number or version type."
    echo "Usage: npm run deploy -- <version> <major|minor|patch>"
    exit 1
  fi

git checkout master

echo "Pulling latest changes from master branch..."
git pull

echo "Running lint checks..."
npm run lint

echo "Running unit tests..."
npm test

echo "Building project..."
npm run build

git status --short

echo "Do you want to proceed with staging these files? (yes/no)"
read CONFIRMATION

if [[ "$CONFIRMATION" == "yes" ]]; then
  echo "Staging changes..."
  git add .

  git commit -m "Bundle release $RELEASE_VERSION"

  echo "Bumping version..."
  npm version $VERSION_TYPE

  echo "Publishing to npm..."
  npm publish --access public

  echo "Pushing changes to repository..."
  git push --tags origin master

  echo "Deployment complete!"
else
  echo "Staging aborted. No changes committed. Deployment aborted."
fi

#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}


upload_files() {
  git remote add production https://${GLICH_TOKEN}@api.glitch.com/git/fish-footman > /dev/null 2>&1
  git pull production master
  git push --quiet --set-upstream production master 
}

setup_git
upload_files

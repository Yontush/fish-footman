/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
const path = require('path')
const _ = require('lodash')
const { prTrigger, issueTrigger } = require('./src/config')
const { getFishyDirs, getPullRequests, createStatus } = require('./src/lib')

const fs = require('fs')

const limitMerge = context =>
  Promise.all([
    getFishyDirs(context),
    getPullRequests(context)
      .then(prs => Promise.all(prs.map(async ({number, head: {sha}}) =>
        createStatus(context, sha)
        .then(() =>
          context.github.paginate(
            context.github.pullRequests.listFiles(context.repo({ number })),
            (files) => [number, sha, files.data.map(({filename}) => filename)]
          )
        )
      )))
  ])
  .then(([restrictedDirs, prs]) => Promise.all(prs.map(async ([number, sha, files]) => createStatus(
      context,
      sha,
      _.intersectionWith(
        files,
        restrictedDirs,
        (file, dir) => file.startsWith(dir)
      ).length > 0 ? 'failure' : 'success'
    ))
  ))

module.exports = app => {
  app.log('fish footman is running!')

  // app.on('issues', async (context) => {
  //   context.github.issues.listForRepo(
  //     context.repo({
  //       sstate: 'open',
  //       labels: 'Fishy'
  //     })
  //   ).then((res) => fs.writeFileSync('test/fixtures/fishy-issues-list.json', JSON.stringify(res, null, 2)))
  // })

  app.on('issues', limitMerge)
  //app.on('pull_request', limitMerge)
}

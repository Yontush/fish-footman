/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */

const _ = require('lodash')
const { getFishyDirs, getPullRequests, createStatus } = require('./src/lib')

const limitMerge = context =>
  Promise.all([
    getFishyDirs(context),
    getPullRequests(context)
      .then(prs => Promise.all(prs.map(({ number, head: { sha } }) =>
        createStatus(context, sha)
          .then(() =>
            context.github.paginate(
              context.github.pullRequests.listFiles.endpoint.merge(context.repo({ pull_number: number })),
              (files) => [sha, files.data.map(({ filename }) => filename)]
            )
          )
      )))
  ])
    .then(([restrictedDirs, prs]) => Promise.all(prs.map(([sha, files]) => createStatus(
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
  app.on('issues', limitMerge)
  app.on('pull_request', limitMerge)
}

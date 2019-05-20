/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
const _ = require('lodash')
const { prTrigger, issueTrigger } = require('./src/config')
const { getPullRequests, createStatus } = require('./src/lib')

module.exports = app => {
  app.log('fish footman is running!')
  app.on('issues', async context =>
    getPullRequests(context)
    //.then(res => console.log(res.map(res => res.number)))
    .then(prs => Promise.all(prs.map(async ({number}) =>
       context.github.paginate(
         context.github.pullRequests.listFiles(context.repo({ number})),
         (res) => res.data
       )
    )))
    .then(res => console.log(res))
  )
  // app.on('pull_request', async context =>
  //   context.payload.action in prTrigger ?
  //   getFishyIssues(context)
  //     .then((res) => )
  //      :
  //     app.log(`ignored PR action: ${context.payload.action}`)
  // )

  // app.on('issues', async context => context.payload.action in issueTrigger ? app.log(`issue action: ${context.payload.action}`) : app.log(`ignored issue action: ${context.payload.action}`))

}

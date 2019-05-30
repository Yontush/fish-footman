const _ = require('lodash')
const path = require('path')
const { labelName, statusName, statusDescription } = require('./config')

module.exports = {
  getFishyDirs: (context) => context.github.issues.listForRepo(
    context.repo({
      state: 'open',
      labels: labelName
    })
  ).then(({ data }) => _.chain(data)
    .map(({ body }) => body.split('\r\n'))
    .flatten()
    .uniq()
    .compact()
    .map((dir) => path.normalize(dir))
    .value()
  ),

  getOpenPrs: (context) => context.github.paginate(
    context.github.pullRequests.list.endpoint.merge(context.repo({ state: 'open' })),
    ({ data }) => data
  ).then(res => _.flatten(res)),

  getPrFileNames: (context, number) => context.github.paginate(
    context.github.pullRequests.listFiles.endpoint.merge(
      context.repo({ pull_number: number })
    ),
    (res) => res.data.map(({ filename }) => filename)
  ),

  createStatus: (context,
    sha = context.payload.pull_request.head.sha,
    state = 'pending',
    status = { name: statusName, descr: statusDescription }
  ) => context.github.repos.createStatus(
    context.repo({
      context: status.name,
      sha,
      state,
      description: status.descr
    })
  )
}

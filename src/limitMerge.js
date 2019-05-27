const { gatherState, paginateIssuesQuery } = require('./queries')
const { labelName } = require('./config')
const { paginate, paginateFiles } = require('./lib')
const _ = require('lodash')

module.exports = async (context) => {
  const { repository: { issues, pullRequests }} = await context.github.query(gatherState, context.repo({ label: [labelName]}))

  const restrictions = _
    .chain(
      issues.pageInfo.hasNextPage ?
        issues.nodes.concat(
          await paginate(context, paginateIssuesQuery, { cursor: issuse.pageInfo.endCursor })
        ) :
        issues.nodes
    )
    .map(({body}) => body)
    .uniq()
    .compact()
    .value()

  }


  console.log(JSON.stringify({issues, pullRequests}))
}


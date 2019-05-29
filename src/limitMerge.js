const { gatherState, paginateIssuesQuery } = require('./queries')
const { labelName } = require('./config')
const { paginate, paginateFiles } = require('./lib')
const _ = require('lodash')
const path = require('path')

const fishyNodes = async (
  context,
  params = context.repo({label: labelName}),
  query = `
  query ($owner: String!, $repo: String!, $label: [String!], $cursor: String) {
    repository(owner: $owner, name: $repo) {
      result: issues(states: OPEN, labels: $label, first: 100, after: $cursor) {
        pageInfo { endCursor, hasNextPage }
        nodes { body }
      }
    }
  }
  `
) => context.github
  .query(query, context.repo({label}))
  .then(({repository: {result: {nodes, pageInfo}}}) => {nodes, pageInfo})
  .then(async ({nodes, pageInfo: {hasNextPage, endCursor: cursor}}) =>
    hasNextPage ?
      nodes.concat(await fishyNodes(context, {...params, cursor })) :
      nodes
  )


const restrictedDirs = (context) => fishyNodes(context)
  .then(nodes => _.chain(nodes)
    .map(({ body }) => body.split('\r\n'))
    .flatten()
    .uniq()
    .compact()
    .map((dir) => path.normalize(dir))
    .value()
  )

module.exports = (context) => restrictedDirs(context)
  .then(dirs =>
    context.github.query(`
      query ($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          result: pullRequests(first: 100, states: OPEN, after: $cursor) {
            pageInfo { endCursor, hasNextPage }
            nodes {
              changedFiles
              state
              files(first: 100) {
                pageInfo { endCursor, hasNextPage }
                nodes { path }
              }
            }
          }
        }
      }
    `, context.repo())
    .then()
  )


  // const { repository: { issues, pullRequests }} = await context.github.query(gatherState, context.repo({ label: [labelName]}))

  // const restrictions = _
  //   .chain(
  //     issues.pageInfo.hasNextPage ?
  //       issues.nodes.concat(
  //         await paginate(context, paginateIssuesQuery, { cursor: issuse.pageInfo.endCursor })
  //       ) :
  //       issues.nodes
  //   )
  //   .map(({body}) => body)
  //   .uniq()
  //   .compact()
  //   .value()



  // console.log(JSON.stringify({issues, pullRequests}))
}


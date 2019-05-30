const { getIssues, getPrs, getFiles } = require('./queries')
const { labelName } = require('./config')
const _ = require('lodash')
const path = require('path')

const fishyNodes = async (
  context,
  params = context.repo({label: labelName}),
) => context.github
  .graphql(getIssues, params)
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

async function* filesPage(context, number, { pageInfo: { hasNextPage: nextPage, cursor}, nodes }) {
  yield* nodes.map(({path}) => path)

  while(nextPage) {
    const { hasNextPage, endCursor, nodes } = await context.github
      .graphql(getFiles, context.repo({number, cursor}))
      .then(({ repository: {result: {nodes, pageInfo: {hasNextPage, endCursor}}}}) => ({hasNextPage, endCursor, nodes}))
    nextPage = hasNextPage
    cursor = endCursor
    yield* nodes.map(({path}) => path)
  }
}


async function* pullrequests(context) {
  let nextPage = true
  let cursor = null

  while(nextPage) {
    const { hasNextPage, endCursor, nodes } = await context.github
      .graphql(getPrs, context.repo({cursor}))
      .then(({ repository: {result: {nodes, pageInfo: {hasNextPage, endCursor}}}}) => ({hasNextPage, endCursor, nodes}))

    nextPage = hasNextPage
    cursor = endCursor

    yield* nodes.map(({files: nodes, sha, number}) => ({ sha, files: files(context, number, nodes)}))
  }
}

module.exports = async (context) => {
  context.log('Gathering restrictions')
  const restrictions = await restrictedDirs(context)
  context.log(`Got ${restrictions.length} restrictions`)

  for await (const pr of pullrequests(context)) {
    context.log(`Validating PR #${pr.number}`)
    validate: {
      await createStatus(context, pr.sha, 'pending')
      for await (const file of pr.files()) {
        if(restrictions.some((dir) => file.startsWith(dir))) {
          context.log(`PR #${pr.number} invalid`)
          await createStatus(context, pr.sha, 'failure')
          break validate
        }
        context.log(`.`)
      }
      context.log(`PR #${pr.number} valid`)
      await createStatus(context, pr.sha, 'success')
    }
  }
}

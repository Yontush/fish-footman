const _ = require('lodash')
const { getFishyDirs, getOpenPrs, getPrFileNames, createStatus } = require('./src/lib')
const limitMerge = require('./src/limitMerge')
// const limitMerge = async context => {
//   const restriction = await getFishyDirs(context)
//   const openPrs = await getOpenPrs(context)

//   return Promise.all(openPrs.map(async ({ number, head: { sha } }) => {
//     await createStatus(context, sha, 'pending')

//     const files = await getPrFileNames(context, number)
//     const merge = _.intersectionWith(
//       files,
//       restriction,
//       (file, dir) => file.startsWith(dir)
//     ).length > 0

//     await createStatus(context, sha, merge ? 'failure' : 'success')
//   }))
// }

module.exports = app => {
  app.log('fish footman is running!')
  app.on('issues', limitMerge)
  app.on('pull_request', limitMerge)
}

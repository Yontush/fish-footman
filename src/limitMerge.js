const { createStatus, restrictedDirs, pullrequests } = require('./lib')
const validatePr = async (context, pr, restrictions) => {
  await createStatus(context, pr.sha, 'pending')
  for await (const file of pr.files) {
    if (restrictions.some((dir) => file.startsWith(dir))) {
      return createStatus(context, pr.sha, 'failure')
    }
  }
  return createStatus(context, pr.sha, 'success')
}

module.exports = async (context) => {
  context.log('Gathering restrictions')
  const restrictions = await restrictedDirs(context)
  context.log(`Got ${restrictions.length} restrictions`)

  for await (const pr of pullrequests(context)) {
    await validatePr(context, pr, restrictions)
  }
}

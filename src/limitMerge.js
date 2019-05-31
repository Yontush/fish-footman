const { createStatus, restrictedDirs, pullrequests } = require('./lib')

module.exports = async (context) => {
  context.log('Gathering restrictions')
  const restrictions = await restrictedDirs(context)
  context.log(`Got ${restrictions.length} restrictions`)

  for await (const pr of pullrequests(context)) {
    context.log(`Validating PR #${pr.number}`)
    let valid = true
    await createStatus(context, pr.sha, 'pending')
    for await (const file of pr.files) {
      if (restrictions.some((dir) => file.startsWith(dir))) {
        context.log(`PR #${pr.number} invalid`)
        await createStatus(context, pr.sha, 'failure')
        valid = false
        break
      }
      context.log(`.`)
    }
    valid && context.log(`PR #${pr.number} valid`)
    valid && await createStatus(context, pr.sha, 'success')
  }
}

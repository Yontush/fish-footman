const _ = require('lodash')
const path = require('path')
const {labelName, statusName, statusDescription } = require('./config')
module.exports = {
	getFishyDirs: async (context) => context.github.issues.listForRepo(
		context.repo({
			state: 'open',
			labels: labelName
		})
	).then(({data}) => _.chain(data)
		.tap(console.log)
		.map(({body}) => body.split('\r\n'))
		.flatten()
		.uniq()
		.compact()
		.map((dir) => path.normalize(dir))
		.value()
	),

	getPullRequests: async (context) => context.github.paginate(
		context.github.pullRequests.list(context.repo({ state: 'open' })),
		({data}) => data
	).then(res => _.flatten(res)),

	createStatus: async (context,
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

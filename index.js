const limitMerge = require('./src/limitMerge')

module.exports = app => {
  app.log('fish footman is running!')
  app.on('issues', limitMerge)
  app.on('pull_request', limitMerge)
}

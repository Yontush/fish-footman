const nock = require('nock')
const myProbotApp = require('..')
const { Probot } = require('probot')

const fixtures = {
  issueCreated: require('./fixtures/fishy-issue-created'),
  issueEdited: require('./fixtures/fishy-issue-edited'),
  issueClosed: require('./fixtures/fishy-issue-closed'),
  prCreated: require('./fixtures/fishy-pr'),
  prFiles: require('./fixtures/fishy-pr-files'),
  prUpdated: require('./fixtures/no-longer-fishy-pr'),
  fishyIssues: require('./fixtures/fishy-issues-list')
  openPrs: require('./fixtures/open-prs-list')
}

nock.disableNetConnect()

describe('fish footman', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    const app = probot.load(myProbotApp)
    app.app = () => 'test'
    nock('https://api.github.com')
      .post('/app/installations/1006543/access_tokens')
      .reply(200, { token: 'test' })
  })

  test('when a fishy issue is created prs that touch fishy paths with be blocked', async () => {
    nock('https://api.github.com')
      .get('/repos/LeonFedotov/fish-footman/issues?state=open&labels=Fishy')
      .reply(200, fixtures.fishyIssues)
    nock('https://api.github.com')
      .get('/repos/LeonFedotov/fish-footman/pulls?state=open')
      .reply(200, fixtures.openPrs)
    await probot.receive({ name: 'issues', payload: fixtures.issueCreated })
  })

  xtest('when a pr is created with restricted paths bot will block it', async () => {

    await probot.receive({ name: 'pull_request', payload: fixtures.prCreated })
  })

  xtest('when a pr is changed to not touch restricted paths pr is unlocked', async () => {

    await probot.receive({ name: 'pull_request', payload: fixtures.prUpdated })
  })

  xtest('when a fishy issue is closed affected prs are unlocked', async () => {

    await probot.receive({ name: 'issues', payload: fixtures.issueClosed })
  })

  xtest('when a fishy issue is edited affected prs are updated', async () => {

    await probot.receive({ name: 'issues', payload: fixtures.issueEdited })
  })
})

// describe('Fish footman', () => {
//   let probot

//   beforeEach(() => {
//     probot = new Probot({})
//     const app = probot.load(myProbotApp)
//     app.app = () => 'test'
//   })

//   test('creates a comment when an issue is opened', async () => {
//     // Test that we correctly return a test token
//     nock('https://api.github.com')
//       .post('/app/installations/2/access_tokens')
//       .reply(200, { token: 'test' })

//     // Test that a comment is posted
//     nock('https://api.github.com')
//       .post('/repos/hiimbex/testing-things/issues/1/comments', (body) => {
//         expect(body).toMatchObject(issueCreatedBody)
//         return true
//       })
//       .reply(200)

//     // Receive a webhook event
//     await probot.receive({ name: 'issues', payload })
//   })
// })


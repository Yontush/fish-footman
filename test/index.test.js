const nock = require('nock')
const myProbotApp = require('..')
const { Probot } = require('probot')

const issueCreatedPayload = require('fishy-issue-created.fixture')
const issueEditedPayload = require('fishy-issue-edited.fixture')
const issueClosedPayload = require('fishy-issue-closed.fixture')
const prPayload = require('fishy-pr.fixture')
const prFilesPayload = require('fishy-pr-files.fixture')
const updatedPr = require('no-longer-fishy-pr.fixture')

nock.disableNetConnect()

describe('fish footman', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    const app = probot.load(myProbotApp)
    app.app = () => 'test'
  })

  test('when a fishy issue is created prs that touch fishy paths with be blocked')
  test('when a pr is created with restricted paths bot will block it')
  test('when a pr is changed to not touch restricted paths pr is unlocked')
  test('when a fishy issue is closed affected prs are unlocked')
  test('when a fishy issue is edited affected prs are updated')
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


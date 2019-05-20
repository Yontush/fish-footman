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
  fishyIssues: require('./fixtures/fishy-issues-list'),
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
  }, 10000)

  test('when a fishy issue is created prs that touch fishy paths with be blocked', async () => {
    nock('https://api.github.com')
      .log(console.log)
      .on('error', function(err){
          console.log(err);
      })
      .get('/repos/LeonFedotov/fish-footman/issues?state=open&labels=Fishy')
      .reply(200, fixtures.fishyIssues)
      .get('/repos/LeonFedotov/fish-footman/pulls?state=open')
      .reply(200, fixtures.openPrs)
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae'

      )
      .reply(200)
      .get('/repos/LeonFedotov/fish-footman/pulls/10/files')
      .reply(200, fixtures.prFiles)
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'failure',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200)


    return probot.receive({ name: 'issues', payload: fixtures.issueCreated })
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

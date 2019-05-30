const nock = require('nock')
const myProbotApp = require('..')
const { statusName, statusDescription } = require('../src/config')
const getProbot = require('./mocks/probot')

const fixtures = {
  getIssues: require('./fixtures/gql-get-issues.json'),
  getPrs: require('./fixtures/gql-get-prs.json'),

  issueCreated: require('./fixtures/fishy-issue-created'),
  issueEdited: require('./fixtures/fishy-issue-edited'),
  issueClosed: require('./fixtures/fishy-issue-closed'),
  prCreated: require('./fixtures/fishy-pr-created'),
  prFiles: require('./fixtures/fishy-pr-files'),
  fixedprFiles: require('./fixtures/fixed-pr-files'),
  prUpdated: require('./fixtures/no-longer-fishy-pr'),
  fishyIssues: require('./fixtures/fishy-issues-list'),
  openPrs: require('./fixtures/open-prs-list')
}

nock.disableNetConnect()

describe('fish footman', () => {
  let probot = getProbot(myProbotApp)

  beforeEach(() => {
    nock('https://api.github.com')
      .on('error', (err) => console.error(err))
      .post('/app/installations/1006543/access_tokens')
      .reply(200, { token: 'test' })
      // .get('/repos/LeonFedotov/fish-footman/pulls?state=open')
      // .reply(200, fixtures.openPrs)
  })

  test('when a fishy issue is created prs that touch fishy paths with be blocked', async () => {
    nock('https://api.github.com')
      .post('/graphql')
      .reply(200, fixtures.getIssues)
      .post('/graphql')
      .reply(200, fixtures.getPrs)
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/e4e337875aef068f4f3cbe8f1831fcb1781b8c6b',
        (body) => {
          expect(body).toMatchObject({
            context: statusName,
            state: 'pending',
            description: statusDescription
          })
          return true
        }
      )
      .reply(200, {})
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/e4e337875aef068f4f3cbe8f1831fcb1781b8c6b',
        (body) => {
          expect(body).toMatchObject({
            context: statusName,
            state: 'failure',
            description: statusDescription
          })
          return true
        }
      )
      .reply(200, {})
    await probot.receive({ name: 'issues', payload: fixtures.issueCreated })
  })

  xtest('when a pr is created with restricted paths bot will block it', async () => {
    nock('https://api.github.com')
      .get('/repos/LeonFedotov/fish-footman/issues?state=open&labels=Fishy')
      .reply(200, fixtures.fishyIssues)
      .get('/repos/LeonFedotov/fish-footman/pulls/10/files')
      .reply(200, fixtures.prFiles)
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'pending',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200, {})
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
      .reply(200, {})
    await probot.receive({ name: 'pull_request', payload: fixtures.prCreated })
  })

  xtest('when a pr is changed to not touch restricted paths pr is unlocked', async () => {
    nock('https://api.github.com')
      .get('/repos/LeonFedotov/fish-footman/issues?state=open&labels=Fishy')
      .reply(200, fixtures.fishyIssues)
      .get('/repos/LeonFedotov/fish-footman/pulls/10/files')
      .reply(200, fixtures.fixedprFiles)
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'pending',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200, {})
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'success',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200, {})
    await probot.receive({ name: 'pull_request', payload: fixtures.prUpdated })
  })

  xtest('when a fishy issue is closed affected prs are unlocked', async () => {
    nock('https://api.github.com')
      .get('/repos/LeonFedotov/fish-footman/issues?state=open&labels=Fishy')
      .reply(200, [])
      .get('/repos/LeonFedotov/fish-footman/pulls/10/files')
      .reply(200, fixtures.prFiles)
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'pending',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200, {})
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'success',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200, {})
    await probot.receive({ name: 'issues', payload: fixtures.issueClosed })
  })

  xtest('when a fishy issue is edited affected prs are updated', async () => {
    nock('https://api.github.com')
      .get('/repos/LeonFedotov/fish-footman/issues?state=open&labels=Fishy')
      .reply(200, [])
      .get('/repos/LeonFedotov/fish-footman/pulls/10/files')
      .reply(200, fixtures.prFiles)
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'pending',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200, {})
      .post(
        '/repos/LeonFedotov/fish-footman/statuses/a7c2e132b30d225509f71123f3bc26a3d1754fae',
        (body) => {
          expect(body).toMatchObject({
            context: 'Directory Locks',
            state: 'success',
            description: 'Checking mergeability'
          })
          return true
        }
      )
      .reply(200, {})
    await probot.receive({ name: 'issues', payload: fixtures.issueEdited })
  })
})

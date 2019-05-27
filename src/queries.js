module.exports = {
  gatherState: `
    query ($owner: String!, $repo: String!, $label: [String!]) {
      repository(owner: $owner, name: $repo) {
        issues(states: OPEN, labels: $label, first: 100) {
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              body
            }
          }
        }
        pullRequests(first: 100, states: OPEN) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            changedFiles
            state
            files(first: 100) {
              pageInfo {
                endCursor
                hasNextPage
              }
              edges {
                node {
                  path
                }
              }
            }
          }
        }
      }
    }
  `,

  paginateIssuesQuery: `
    query ($owner: String!, $repo: String!, $label: [String!], $cursor: String!) {
      repository(owner: $owner, name: $repo) {
        result: issues(states: OPEN, labels: $label, first: 100, after: $cursor) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            body
          }
        }
      }
    }
  `,

  paginatePrs: `
    query ($owner: String!, $repo: String!, $cursor: String!) {
      repository(owner: $owner, name: $repo) {
        result: pullRequests(first: 100, states: OPEN, after: $cursor) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            changedFiles
            state
            files(first: 100) {
              pageInfo {
                endCursor
                hasNextPage
              }
              nodes {
                path
              }
            }
          }
        }
      }
    }
  `,

  paginatePrFiles: `
    query ($owner: String!, $repo: String!, $number: Int!, $cursor: String!) {
      repository(owner: $owner, name: $repo) {
        result: pullRequest(number: $number) {
          files(first:100, after: $cursor) {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              path
            }
          }
        }
      }
    }
  `,
}

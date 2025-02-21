const proxyquire = require('proxyquire')

const sanitizedExecStub = sinon.stub().returns('')

const {
  getGitMetadata,
  GIT_COMMIT_SHA,
  GIT_BRANCH,
  GIT_TAG,
  GIT_REPOSITORY_URL,
  GIT_COMMIT_MESSAGE,
  GIT_COMMIT_COMMITTER_DATE,
  GIT_COMMIT_COMMITTER_EMAIL,
  GIT_COMMIT_COMMITTER_NAME,
  GIT_COMMIT_AUTHOR_DATE,
  GIT_COMMIT_AUTHOR_EMAIL,
  GIT_COMMIT_AUTHOR_NAME
} = proxyquire('../../../src/plugins/util/git',
  {
    './exec': {
      'sanitizedExec': sanitizedExecStub
    }
  }
)

describe('git', () => {
  afterEach(() => {
    sanitizedExecStub.reset()
  })
  it('returns ci metadata if it is present and does not call git for those parameters', () => {
    const ciMetadata = { commitSHA: 'ciSHA', branch: 'myBranch' }
    const metadata = getGitMetadata(ciMetadata)

    expect(metadata).to.contain(
      {
        [GIT_COMMIT_SHA]: 'ciSHA',
        [GIT_BRANCH]: 'myBranch'
      }
    )
    expect(metadata[GIT_REPOSITORY_URL]).not.to.equal('ciRepositoryUrl')
    expect(sanitizedExecStub).to.have.been.calledWith('git ls-remote --get-url', { stdio: 'pipe' })
    expect(sanitizedExecStub).to.have.been.calledWith('git show -s --format=%s', { stdio: 'pipe' })
    expect(sanitizedExecStub).to.have.been.calledWith('git show -s --format=%an,%ae,%ad,%cn,%ce,%cd', { stdio: 'pipe' })
    expect(sanitizedExecStub).not.to.have.been.calledWith('git rev-parse HEAD', { stdio: 'pipe' })
    expect(sanitizedExecStub).not.to.have.been.calledWith('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' })
  })
  it('does not crash if git is not available', () => {
    sanitizedExecStub.returns('')
    const ciMetadata = { repositoryUrl: 'ciRepositoryUrl' }
    const metadata = getGitMetadata(ciMetadata)
    expect(metadata).to.eql({
      [GIT_BRANCH]: '',
      [GIT_TAG]: undefined,
      [GIT_COMMIT_MESSAGE]: '',
      [GIT_COMMIT_SHA]: '',
      [GIT_REPOSITORY_URL]: 'ciRepositoryUrl',
      [GIT_COMMIT_COMMITTER_EMAIL]: undefined,
      [GIT_COMMIT_COMMITTER_DATE]: undefined,
      [GIT_COMMIT_COMMITTER_NAME]: undefined,
      [GIT_COMMIT_AUTHOR_EMAIL]: undefined,
      [GIT_COMMIT_AUTHOR_DATE]: undefined,
      [GIT_COMMIT_AUTHOR_NAME]: ''
    })
  })
  it('returns all git metadata is git is available', () => {
    sanitizedExecStub
      .onCall(0).returns('git author,git.author@email.com,1972,git committer,git.committer@email.com,1973')
      .onCall(1).returns('this is a commit message')
      .onCall(2).returns('gitRepositoryUrl')
      .onCall(3).returns('gitBranch')
      .onCall(4).returns('gitCommitSHA')

    const metadata = getGitMetadata({ tag: 'ciTag' })
    expect(metadata).to.eql({
      [GIT_BRANCH]: 'gitBranch',
      [GIT_TAG]: 'ciTag',
      [GIT_COMMIT_MESSAGE]: 'this is a commit message',
      [GIT_COMMIT_SHA]: 'gitCommitSHA',
      [GIT_REPOSITORY_URL]: 'gitRepositoryUrl',
      [GIT_COMMIT_AUTHOR_EMAIL]: 'git.author@email.com',
      [GIT_COMMIT_AUTHOR_DATE]: '1972',
      [GIT_COMMIT_AUTHOR_NAME]: 'git author',
      [GIT_COMMIT_COMMITTER_EMAIL]: 'git.committer@email.com',
      [GIT_COMMIT_COMMITTER_DATE]: '1973',
      [GIT_COMMIT_COMMITTER_NAME]: 'git committer'
    })
    expect(sanitizedExecStub).to.have.been.calledWith('git ls-remote --get-url', { stdio: 'pipe' })
    expect(sanitizedExecStub).to.have.been.calledWith('git show -s --format=%s', { stdio: 'pipe' })
    expect(sanitizedExecStub).to.have.been.calledWith('git show -s --format=%an,%ae,%ad,%cn,%ce,%cd', { stdio: 'pipe' })
    expect(sanitizedExecStub).to.have.been.calledWith('git rev-parse HEAD', { stdio: 'pipe' })
    expect(sanitizedExecStub).to.have.been.calledWith('git rev-parse --abbrev-ref HEAD', { stdio: 'pipe' })
  })
})

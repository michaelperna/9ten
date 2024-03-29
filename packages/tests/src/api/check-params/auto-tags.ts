/* eslint-disable @typescript-eslint/no-unused-expressions,@typescript-eslint/require-await */

import { HttpStatusCode } from '@peertube/peertube-models'
import {
  PeerTubeServer,
  cleanupTests,
  createSingleServer, setAccessTokensToServers,
  setDefaultVideoChannel
} from '@peertube/peertube-server-commands'

describe('Test auto tag policies API validator', function () {
  let server: PeerTubeServer

  let userToken: string
  let userToken2: string

  // ---------------------------------------------------------------

  before(async function () {
    this.timeout(120000)

    server = await createSingleServer(1)

    await setAccessTokensToServers([ server ])
    await setDefaultVideoChannel([ server ])

    userToken = await server.users.generateUserAndToken('user1')
    userToken2 = await server.users.generateUserAndToken('user2')
  })

  describe('When getting available account auto tags', function () {

    it('Should fail without token', async function () {
      await server.autoTags.getAccountAvailable({
        accountName: 'user1',
        token: null,
        expectedStatus: HttpStatusCode.UNAUTHORIZED_401
      })
    })

    it('Should fail with a user that cannot manage account', async function () {
      await server.autoTags.getAccountAvailable({
        accountName: 'user1',
        token: userToken2,
        expectedStatus: HttpStatusCode.FORBIDDEN_403
      })
    })

    it('Should fail with an unknown account', async function () {
      await server.autoTags.getAccountAvailable({
        accountName: 'user42',
        token: userToken2,
        expectedStatus: HttpStatusCode.NOT_FOUND_404
      })
    })

    it('Should succeed with the correct params', async function () {
      await server.autoTags.getAccountAvailable({ accountName: 'user1', token: userToken })
    })
  })

  describe('When getting available server auto tags', function () {

    it('Should fail without token', async function () {
      await server.autoTags.getServerAvailable({ token: null, expectedStatus: HttpStatusCode.UNAUTHORIZED_401 })
    })

    it('Should fail with a user that that does not have enought rights', async function () {
      await server.autoTags.getServerAvailable({ token: userToken, expectedStatus: HttpStatusCode.FORBIDDEN_403 })
    })

    it('Should succeed with the correct params', async function () {
      await server.autoTags.getServerAvailable()
    })
  })

  describe('When getting auto tag policies', function () {

    it('Should fail without token', async function () {
      await server.autoTags.getCommentPolicies({
        accountName: 'user1',
        token: null,
        expectedStatus: HttpStatusCode.UNAUTHORIZED_401
      })
    })

    it('Should fail with a user that cannot manage account', async function () {
      await server.autoTags.getCommentPolicies({
        accountName: 'user1',
        token: userToken2,
        expectedStatus: HttpStatusCode.FORBIDDEN_403
      })
    })

    it('Should fail with an unknown account', async function () {
      await server.autoTags.getCommentPolicies({
        accountName: 'user42',
        token: userToken2,
        expectedStatus: HttpStatusCode.NOT_FOUND_404
      })
    })

    it('Should succeed with the correct params', async function () {
      await server.autoTags.getCommentPolicies({ accountName: 'user1', token: userToken })
    })
  })

  describe('When updating auto tag policies', function () {

    it('Should fail without token', async function () {
      await server.autoTags.updateCommentPolicies({
        accountName: 'user1',
        review: [ 'external-link' ],
        token: null,
        expectedStatus: HttpStatusCode.UNAUTHORIZED_401
      })
    })

    it('Should fail with a user that cannot manage account', async function () {
      await server.autoTags.updateCommentPolicies({
        accountName: 'user1',
        review: [ 'external-link' ],
        token: userToken2,
        expectedStatus: HttpStatusCode.FORBIDDEN_403
      })
    })

    it('Should fail with an unknown account', async function () {
      await server.autoTags.updateCommentPolicies({
        accountName: 'user42',
        review: [ 'external-link' ],
        token: userToken,
        expectedStatus: HttpStatusCode.NOT_FOUND_404
      })
    })

    it('Should fail with invalid review array', async function () {
      await server.autoTags.updateCommentPolicies({
        accountName: 'user1',
        review: 'toto' as any,
        token: userToken,
        expectedStatus: HttpStatusCode.BAD_REQUEST_400
      })
    })

    it('Should fail with review array that does not contain available tags', async function () {
      await server.autoTags.updateCommentPolicies({
        accountName: 'user1',
        review: [ 'toto' ],
        token: userToken,
        expectedStatus: HttpStatusCode.BAD_REQUEST_400
      })
    })

    it('Should succeed with the correct params', async function () {
      await server.autoTags.updateCommentPolicies({
        accountName: 'user1',
        review: [ 'external-link' ],
        token: userToken
      })
    })
  })

  after(async function () {
    await cleanupTests([ server ])
  })
})

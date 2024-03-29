import { ActivityApproveReply, ActivityRejectReply } from '@peertube/peertube-models'
import { logger } from '../../../helpers/logger.js'
import { MCommentOwnerVideoReply } from '../../../types/models/index.js'
import { unicastTo } from './shared/send-utils.js'
import { getLocalApproveReplyActivityPubUrl, getLocalRejectReplyActivityPubUrl } from '../url.js'

export function sendReplyApproval (comment: MCommentOwnerVideoReply, type: 'ApproveReply' | 'RejectReply') {
  logger.info('Creating job to approve reply %s.', comment.url)

  const data = buildApprovalActivity({ comment, type })

  return unicastTo({
    data,
    byActor: comment.Video.VideoChannel.Account.Actor,
    toActorUrl: comment.Account.Actor.inboxUrl,
    contextType: type
  })
}

export function buildApprovalActivity (options: {
  comment: MCommentOwnerVideoReply
  type: 'ApproveReply' | 'RejectReply'
}): ActivityApproveReply | ActivityRejectReply {
  const { comment, type } = options

  return {
    type,
    id: type === 'ApproveReply'
      ? getLocalApproveReplyActivityPubUrl(comment.Video, comment)
      : getLocalRejectReplyActivityPubUrl(comment.Video, comment),
    actor: comment.Video.VideoChannel.Account.Actor.url,
    inReplyTo: comment.InReplyToVideoComment?.url ?? comment.Video.url,
    object: comment.url
  }
}

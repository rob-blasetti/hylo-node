import decode from 'ent/decode'
var format = require('util').format
var rollbar = require('rollbar')

module.exports = bookshelf.Model.extend({
  tableName: 'push_notifications',

  send: function (options) {
    var deviceToken = this.get('device_token')
    var platform = this.getPlatform()
    var alert = this.get('alert')
    var path = this.get('path')
    var badgeNo = this.get('badge_no')

    return this.save({'time_sent': (new Date()).toISOString()}, options)
    .then(pn => OneSignal.notify(platform, deviceToken, alert, path, badgeNo))
    .catch(e => rollbar.handleErrorWithPayloadData(e, {custom: {server_token: process.env.ONESIGNAL_APP_ID, device_token: deviceToken}}))
  },

  getPlatform: function () {
    var platform = this.get('platform')
    if (platform) {
      return platform
    } else {
      return 'ios_macos'
    }
  }

}, {
  textForComment: function (comment, version, userId) {
    var post = comment.relations.post
    var commenter = comment.relations.user
    var postName, relatedUser

    if (post.isWelcome()) {
      relatedUser = post.relations.relatedUsers.first()
      if (relatedUser.id === userId) {
        postName = 'your welcome post'
      } else {
        postName = format("%s's welcome post", relatedUser.get('name'))
      }
    } else {
      postName = format('"%s"', decode(post.get('name')))
    }

    if (version === 'mention') {
      return format('%s mentioned you in a comment on %s', commenter.get('name'), postName)
    }

    return format('%s commented on %s', commenter.get('name'), postName)
  },

  textForPost: function (post, community, userId, version) {
    var relatedUser
    var poster = post.relations.user

    if (post.isWelcome()) {
      relatedUser = post.relations.relatedUsers.first()
      if (relatedUser.id === userId) {
        return format('You joined %s!', community.get('name'))
      } else {
        return format('%s joined %s', relatedUser.get('name'), community.get('name'))
      }
    } else if (version === 'mention') {
      return format('%s mentioned you in "%s"', poster.get('name'), decode(post.get('name')))
    } else {
      return format('%s posted "%s" in %s', poster.get('name'), decode(post.get('name')), community.get('name'))
    }
  }

})

var setup = require(require('root-path')('test/setup'));

describe('Membership', function() {

  var user, community;

  before(function(done) {
    setup.initDb(function() {
      community = new Community({slug: 'foo', name: 'Foo'});
      community.save().then(function() {
        user = new User({name: 'Cat'});
        return user.save();
      }).then(function() {
        return user.joinCommunity(community);
      }).exec(done);
    });
  });

  after(function(done) {
    setup.clearDb(done);
  });

  describe('.withIds', function() {

    it('works with a community id', function(done) {
      Membership.withIds(user.id, community.id).then(function(membership) {
        expect(membership).to.exist;
      }).then(done);
    });

    it('works with a community slug', function(done) {
      Membership.withIds(user.id, community.get('slug')).then(function(membership) {
        expect(membership).to.exist;
      }).then(done);
    });

  });

});
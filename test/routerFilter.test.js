/*globals test:true module:true ok:true QUnit:true sinon:true */
(function() {
  var router;
  var TestRouter = Backbone.Router.extend({
        beforeFilter: {
          filterMethod: function() {},
          routes: {
            only: ['beforeFilteredRoute', 'bothFilteredRoute']
          }
        },

        afterFilter: {
          filterMethod: function() {},
          routes: {
            only: ['afterFilteredRoute', 'bothFilteredRoute']
          }
        },

        routes: {
          'beforeFilteredRoute' : 'beforeFilteredRouteHandler',
          'afterFilteredRoute'  : 'afterFilteredRouteHandler',
          'bothFilteredRoute'   : 'bothFilteredRouteHandler',
          'neitherFilteredRoute': 'neitherFilteredRouteHandler'
        },

        beforeFilteredRouteHandler : function(){},
        afterFilteredRouteHandler  : function(){},
        bothFilteredRouteHandler   : function(){},
        neitherFilteredRouteHandler: function(){}
      });
  var routeTo = function routeTo(route) {
    Backbone.history.navigate(route, {trigger: true});
  };

  QUnit.begin(function() {
    if (!Backbone.History.started) {
      Backbone.history.start();
    }
  });

  module('Filters working together and independently', {
    setup: function() {
      sinon.spy(TestRouter.prototype.beforeFilter, 'filterMethod');
      sinon.spy(TestRouter.prototype.afterFilter, 'filterMethod');
      router = new TestRouter();
    },
    teardown: function() {
      router = undefined;
      Backbone.history.handlers = [];
      Backbone.history.navigate('');
      TestRouter.prototype.beforeFilter.filterMethod.restore();
      TestRouter.prototype.afterFilter.filterMethod.restore();
    }
  });
  test('only the before filter is called', function() {
    routeTo('beforeFilteredRoute');
    ok(router.beforeFilter.filterMethod.called === true, 'The before filter was called on an only route');
    ok(router.afterFilter.filterMethod.called === false, 'The after filter was not called on a route not in its only array');
  });

  test('only the after filter is called', function() {
    routeTo('afterFilteredRoute');
    ok(router.beforeFilter.filterMethod.called === false, 'The before filter was not called on a route not in its only array');
    ok(router.afterFilter.filterMethod.called === true, 'The after filter was called for an only route');
  });

  test('both filters are called', function() {
    routeTo('bothFilteredRoute');
    ok(router.beforeFilter.filterMethod.called === true, 'The before filter was called on an only route');
    ok(router.afterFilter.filterMethod.called === true, 'The after filter was called for an only route');
  });

  test('neither filter is called', function() {
    routeTo('neitherFilteredRoute');
    ok(router.beforeFilter.filterMethod.called === false, 'The before filter was not called for a route not in its only array');
    ok(router.afterFilter.filterMethod.called === false, 'The after filter was not called for a route not in its only array');
  });
})();
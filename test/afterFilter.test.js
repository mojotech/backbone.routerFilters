/*globals test:true module:true ok:true QUnit:true sinon:true */
(function() {
  var router;
  var TestRouter = Backbone.Router.extend({
        afterFilter: {
          filterMethod: function() {}
        },

        routes: {
          'filteredRoute'  : 'filteredRouteHandler',
          'unfilteredRoute': 'unfilteredRouteHandler'
        },

        filteredRouteHandler  : function(){},
        unfilteredRouteHandler: function(){}
      });
  var routeTo = function routeTo(route) {
    Backbone.history.navigate(route, {trigger: true});
  };

  QUnit.begin(function() {
    if (!Backbone.History.started) {
      Backbone.history.start();
    }
  });

  module('afterFilter.routes: `only` and `except`', {
    setup: function() {
      sinon.spy(TestRouter.prototype.afterFilter, 'filterMethod');
      router = new TestRouter();
    },
    teardown: function() {
      router = undefined;
      Backbone.history.handlers = [];
      Backbone.history.navigate('');
      TestRouter.prototype.afterFilter.filterMethod.restore();
      TestRouter.prototype.afterFilter.routes = undefined;
    }
  });
  test('the filter method should be applied to all routes when no control is specified', function() {
    routeTo('filteredRoute');
    routeTo('unfilteredRoute');

    ok(router.afterFilter.filterMethod.calledTwice, 'with no routes specified, filterMethod was called for each route');
  });

  test('the filter method is not called on routes in `except`', function() {
    router.afterFilter.routes = {except: ['unfilteredRoute']};

    routeTo('unfilteredRoute');
    ok(router.afterFilter.filterMethod.called === false, 'filterMethod was not called for the route in except');

    routeTo('filteredRoute');
    ok(router.afterFilter.filterMethod.calledOnce, 'filterMethod was called only for the route not in except');
  });

  test('the filter method is only called on routes not in `only`', function() {
    router.afterFilter.routes = {only: ['filteredRoute']};

    routeTo('unfilteredRoute');
    ok(router.afterFilter.filterMethod.called === false, 'filterMethod was not called for the routes not in only');

    routeTo('filteredRoute');
    ok(router.afterFilter.filterMethod.calledOnce, 'filterMethod was called only for the routes in only');
  });

  test('`except` has a higher priority over `only`', function() {
    router.afterFilter.routes = {
      only:   ['unfilteredRoute'],
      except: ['unfilteredRoute']
    };

    routeTo('unfilteredRoute');
    ok(router.afterFilter.filterMethod.called === false, 'filterMethod was not called for the route in except');

    routeTo('filteredRoute');
    ok(router.afterFilter.filterMethod.calledOnce, 'filterMethod was called only for the route not in except');
  });

  test('the routes are matched on regexps', function() {
    router.afterFilter.routes = {only: [/filtered/]};

    routeTo('filteredRoute');
    routeTo('unfilteredRoute');

    ok(router.afterFilter.filterMethod.calledTwice, 'filterMethod was called for both routes matching the regexp');
  });

  test('the routes can be mixed strings and regexps', function() {
    router.afterFilter.routes = {only: [/unfiltered/, 'filteredRoute']};

    routeTo('filteredRoute');
    routeTo('unfilteredRoute');

    ok(router.afterFilter.filterMethod.calledTwice, 'both routes should be filtered');
  });
})();
/*globals test:true module:true ok:true QUnit:true sinon:true */

var router, filterReturnValue = false;
var testRouter = Backbone.Router.extend({
      beforeFilter: {
        filterMethod: function() {
          return filterReturnValue;
        }
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

module('beforeFilter.routes: `only` and `except`', {
  setup: function() {
    sinon.spy(testRouter.prototype, 'filteredRouteHandler');
    sinon.spy(testRouter.prototype, 'unfilteredRouteHandler');
    sinon.spy(testRouter.prototype.beforeFilter, 'filterMethod');
    filterReturnValue = false;
    router = new testRouter();
  },
  teardown: function() {
    router = undefined;
    filterReturnValue = undefined;
    Backbone.history.handlers = [];
    Backbone.history.navigate('');
    testRouter.prototype.filteredRouteHandler.restore();
    testRouter.prototype.unfilteredRouteHandler.restore();
    testRouter.prototype.beforeFilter.filterMethod.restore();
    testRouter.prototype.beforeFilter.routes = undefined;
  }
});
test('the filter method should be applied to all routes when no control is specified', function() {
  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'with no routes specified, filteredRoute was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === false, 'with no routes specified, unfilteredRoute was filtered');

  ok(router.beforeFilter.filterMethod.calledTwice, 'with no routes specified, filterMethod was called for each route');
});

test('the filter method is not called on routes in `except`', function() {
  router.beforeFilter.routes = {except: ['unfilteredRoute']};

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute is not in except so it was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === true, 'unfilteredRoute is in except so it was not filtered');

  ok(router.beforeFilter.filterMethod.calledOnce, 'filterMethod was called only for the route not in except');
});

test('the filter method is only called on routes not in `only`', function() {
  router.beforeFilter.routes = {only: ['filteredRoute']};

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute is in only so it was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === true, 'unfilteredRoute is not in only so it was not filtered');

  ok(router.beforeFilter.filterMethod.calledOnce, 'filterMethod was called only for the routes in only');
});

test('`except` has a higher priority over `only`', function() {
  router.beforeFilter.routes = {
    only:   ['unfilteredRoute'],
    except: ['unfilteredRoute']
  };

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute is not in except so it was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === true, 'unfilteredRoute is in except so it was not filtered');

  ok(router.beforeFilter.filterMethod.calledOnce, 'filterMethod was called only for the route not in except');
});

test('the routes are matched on regexps', function() {
  router.beforeFilter.routes = {only: [/filtered/]};

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute matches the only regexp so it was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === false, 'unfilteredRoute matches the only regexp so it was filtered');

  ok(router.beforeFilter.filterMethod.calledTwice, 'filterMethod was called for both routes matching the regexp');
});

test('the routes can be mixed strings and regexps', function() {
  router.beforeFilter.routes = {except: [/unfiltered/, 'filteredRoute']};

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === true, 'filteredRoute is in except so it was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === true, 'unfilteredRoute matches the except regexp so it was not filtered');

  ok(router.beforeFilter.filterMethod.called === false, 'no routes should be filtered');
});

module('beforeFilter.filterMethod: controlling routes', {
  setup: function() {
    sinon.spy(testRouter.prototype, 'filteredRouteHandler');
    router = new testRouter();
  },
  teardown: function() {
    router = undefined;
    filterReturnValue = undefined;
    Backbone.history.handlers = [];
    Backbone.history.navigate('');
    testRouter.prototype.filteredRouteHandler.restore();
  }
});
test('the router is stopped if the beforeFilter filterMethod evaluates to `false`', function() {
  filterReturnValue = false;

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRouteHandler was stopped');
});

test('the router continues if the beforeFilter filterMethod evaluates to `true`', function() {
  filterReturnValue = true;

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === true, 'filteredRouteHandler was not stopped');
});

module('the router is not impacted if beforeFilter is not defined', {
  setup: function() {
    sinon.spy(testRouter.prototype, 'filteredRouteHandler');
    sinon.spy(testRouter.prototype.beforeFilter, 'filterMethod');
    router = new testRouter();
    router.beforeFilter = undefined;
  },
  teardown: function() {
    router = undefined;
    filterReturnValue = undefined;
    Backbone.history.handlers = [];
    Backbone.history.navigate('');
    testRouter.prototype.filteredRouteHandler.restore();
    testRouter.prototype.beforeFilter.filterMethod.restore();
  }
});
test('nothing out of the ordinary happens', function() {
  filterReturnValue = false;

  routeTo('filteredRoute');
  ok(testRouter.prototype.beforeFilter.filterMethod.called === false, 'filter method is never called');
  ok(router.filteredRouteHandler.called === true, 'filteredRouteHandler was not stopped');
});

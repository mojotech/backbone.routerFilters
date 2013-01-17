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
    Backbone.history.navigate('');
    testRouter.prototype.filteredRouteHandler.restore();
    testRouter.prototype.unfilteredRouteHandler.restore();
    testRouter.prototype.beforeFilter.filterMethod.restore();
    testRouter.prototype.beforeFilter.routes = undefined;
  }
});
test('the filter method should be applied to all routes when no control is specified', function() {
  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === false, 'unfilteredRoute was filtered');

  ok(router.beforeFilter.filterMethod.calledTwice, 'filterMethod was called for each route');
});

test('the filter method is not called on routes in `except`', function() {
  router.beforeFilter.routes = {except: ['unfilteredRoute']};

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === true, 'unfilteredRoute was not filtered');

  ok(router.beforeFilter.filterMethod.calledOnce, 'filterMethod was called only for the filtered route');
});

test('the filter method is only called on routes not in `only`', function() {
  router.beforeFilter.routes = {only: ['filteredRoute']};

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === true, 'unfilteredRoute was not filtered');

  ok(router.beforeFilter.filterMethod.calledOnce, 'filterMethod was called only for the filtered route');
});

test('`except` has a higher priority over `only`', function() {
  router.beforeFilter.routes = {
    only:   ['unfilteredRoute'],
    except: ['unfilteredRoute']
  };

  routeTo('filteredRoute');
  ok(router.filteredRouteHandler.called === false, 'filteredRoute was filtered');

  routeTo('unfilteredRoute');
  ok(router.unfilteredRouteHandler.called === true, 'unfilteredRoute was not filtered');

  ok(router.beforeFilter.filterMethod.calledOnce, 'filterMethod was called only for the filtered route');
});

module('beforeFilter.filterMethod: controlling routes', {
  setup: function() {
    sinon.spy(testRouter.prototype, 'filteredRouteHandler');
    router = new testRouter();
  },
  teardown: function() {
    router = undefined;
    filterReturnValue = undefined;
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
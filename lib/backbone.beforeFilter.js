Backbone.Router.prototype.route = function(route, name, callback) {
  var originalRoute = route;
  if (!_.isRegExp(route)) {
    route = this._routeToRegExp(route);
  }
  if (!callback) {
    callback = this[name];
  }
  Backbone.history.route(route, _.bind(function(fragment) {
    var args         = this._extractParameters(route, fragment),
        beforeFilter = this.beforeFilter,
        runCallback  = true;

    if (beforeFilter) {
      var allRoutes = beforeFilter.routes === undefined || _.isEmpty(beforeFilter.routes);
      var thisRoute = false;

      if (!allRoutes) {
        var only     = beforeFilter.routes.only,
            except   = beforeFilter.routes.except,
            inOnly   = _(only).contains(originalRoute),
            inExcept = _(except).contains(originalRoute);

        thisRoute = (except) ? !inExcept : only && inOnly;
      }

      if (allRoutes || thisRoute) {
        runCallback = beforeFilter.filterMethod.apply(this, args) !== false;
      }
    }

    if (runCallback) {
      if (callback) {
        callback.apply(this, args);
      }
      this.trigger.apply(this, ['route:' + name].concat(args));
      Backbone.history.trigger('route', this, name, args);
    }
  }, this));

  return this;
};
Backbone.Router.prototype.route = function(route, name, callback) {
  if (!_.isRegExp(route)) {
    route = this._routeToRegExp(route);
  }
  if (!callback) {
    callback = this[name];
  }
  var runFilter = function(filter, route, fragment, args) {
    if (filter) {
      var allRoutes = _.isEmpty(filter.routes);
      var thisRoute = false;

      if (!allRoutes) {
        var routeMatches = function(filterRoute) {
          if (typeof filterRoute === 'string') {
            return route.test(filterRoute);
          } else {
            return filterRoute.test(fragment);
          }
        };
        var only     = filter.routes.only,
            except   = filter.routes.except,
            inOnly   = _(only).any(routeMatches),
            inExcept = _(except).any(routeMatches);

        thisRoute = (except) ? !inExcept : only && inOnly;
      }

      if (allRoutes || thisRoute) {
        return filter.filterMethod.apply(this, args) !== false;
      }
    }

    return true;
  };

  Backbone.history.route(route, _.bind(function(fragment) {
    var args        = this._extractParameters(route, fragment),
        runCallback = runFilter(this.beforeFilter, route, fragment, args);

    if (runCallback) {
      if (callback) {
        callback.apply(this, args);
      }
      runFilter(this.afterFilter, route, fragment, args);
      this.trigger.apply(this, ['route:' + name].concat(args));
      Backbone.history.trigger('route', this, name, args);
    }
  }, this));

  return this;
};
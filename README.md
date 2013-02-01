Backbone.RouterFilters
=========

RouterFilters allows you to add before and after filters to your router and configure which methods they're used on.

Usage
=====

RouterFilters only depends on Backbone and its dependencies so you're good to go. Just include backbone.routerFilters.js after Backbone.

To use in your router, define a `beforeFilter` or `afterFilter` object. This object should have a `filterMethod` property which will be the function run at the proper time depending on which filter you're defining. In `beforeFilters`, if this method returns a falsy value, it will stop the execution of the router method.

You can also define an optional `routes` property on your filter if you don't want the `filterMethod` to run on all routes. This `routes` property is an object that should contain either an `only` or `except` property which is an array of strings and/or regexps that will match the methods you want you want your filter to only run on or not run on.

Example
=======

```javascript
var ExampleRouter = Backbone.Router.extend({
  beforeFilter: {
    filterMethod: function() {
      /* something that returns a truthy or falsy value */

      if (Math.floor(100 * Math.random()) % 2 === 0) {
        return true;
      } else {
        return false;
      }
    },
    routes: {
      only: ['filterThisRoute', /filterRoute/]
    }
  },

  afterFilter: {
    filterMethod: function() {
      /* anything you'd want to run after each router method */
      (this.routeCounter && this.routeCounter++) || this.routeCounter = 1;
      console.log('I have routed ' + routeCounter + ' times.');
    }
    /* NOTE: By not defining a routes property, this afterFilter will run on ALL routes */
  },

  routes: {
    'filterThisRoute': 'filterThisRouteHandler',
    'filterRoute1'   : 'filterRoute1Handler',
    'filterRoute2'   : 'filterRoute2Handler',
    'foofilterRoute' : 'foofilterRouteHandler',
    'unfilteredRoute': 'unfilteredRouteHandler'
  },

  filterThisRouteHandler: function() {},
  filterRoute1Handler   : function() {},
  filterRoute2Handler   : function() {},
  foofilterRouteHandler : function() {},
  unfilteredRouteHandler: function() {}
});
```

Credits
==========

[![MojoTech](http://www.mojotech.com/press/logo.png)](http://www.mojotech.com)

License
==========

Backbone.RouterFilters is Copyright © 2013 MojoTech, LLC. and is released under the MIT license.
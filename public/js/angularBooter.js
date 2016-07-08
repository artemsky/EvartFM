AngularBooter = function(appName) {
  return {
    config:       [],
    controllers:  {},
    directives:   {},
    dependencies: [],
    filters:      {},
    services:     {},
    appName:      appName ? appName : 'myApp',
    boot: function() {
      var thiz = this;

      //Create The App Module and Inject Any Dependencies
      angular.module(this.appName, this.dependencies);

      console.log('Booted Dependencies', this.dependencies);

      //Instantiate All Of Our Registered Services
      angular.forEach(this.services, function (serviceFunction, serviceName) {
        angular.module(thiz.appName).factory(serviceName, serviceFunction);
      });

      console.log('Booted Services', this.services);

      //Instantiate our Registered Directives and Controllers
      angular.module(this.appName)
        .directive(this.directives)
        .controller(this.controllers);

      console.log('Booted Directives', this.directives);
      console.log('Booted Controllers', this.controllers);

      angular.forEach(this.config, function (c) {
        angular.module(thiz.appName).config(c);
      });

      console.log('Booted Configs', this.config);

      //Instantiate our Registered Filters
      angular.forEach(this.filters, function (filterFunction, filterName) {
        angular.module(thiz.appName).filter(filterName, filterFunction);
      });

      console.log('Booted Filters', this.filters);
    }
  };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmd1bGFyQm9vdGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIkFuZ3VsYXJCb290ZXIgPSBmdW5jdGlvbihhcHBOYW1lKSB7XG4gIHJldHVybiB7XG4gICAgY29uZmlnOiAgICAgICBbXSxcbiAgICBjb250cm9sbGVyczogIHt9LFxuICAgIGRpcmVjdGl2ZXM6ICAge30sXG4gICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICBmaWx0ZXJzOiAgICAgIHt9LFxuICAgIHNlcnZpY2VzOiAgICAge30sXG4gICAgYXBwTmFtZTogICAgICBhcHBOYW1lID8gYXBwTmFtZSA6ICdteUFwcCcsXG4gICAgYm9vdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGhpeiA9IHRoaXM7XG5cbiAgICAgIC8vQ3JlYXRlIFRoZSBBcHAgTW9kdWxlIGFuZCBJbmplY3QgQW55IERlcGVuZGVuY2llc1xuICAgICAgYW5ndWxhci5tb2R1bGUodGhpcy5hcHBOYW1lLCB0aGlzLmRlcGVuZGVuY2llcyk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdCb290ZWQgRGVwZW5kZW5jaWVzJywgdGhpcy5kZXBlbmRlbmNpZXMpO1xuXG4gICAgICAvL0luc3RhbnRpYXRlIEFsbCBPZiBPdXIgUmVnaXN0ZXJlZCBTZXJ2aWNlc1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHRoaXMuc2VydmljZXMsIGZ1bmN0aW9uIChzZXJ2aWNlRnVuY3Rpb24sIHNlcnZpY2VOYW1lKSB7XG4gICAgICAgIGFuZ3VsYXIubW9kdWxlKHRoaXouYXBwTmFtZSkuZmFjdG9yeShzZXJ2aWNlTmFtZSwgc2VydmljZUZ1bmN0aW9uKTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zb2xlLmxvZygnQm9vdGVkIFNlcnZpY2VzJywgdGhpcy5zZXJ2aWNlcyk7XG5cbiAgICAgIC8vSW5zdGFudGlhdGUgb3VyIFJlZ2lzdGVyZWQgRGlyZWN0aXZlcyBhbmQgQ29udHJvbGxlcnNcbiAgICAgIGFuZ3VsYXIubW9kdWxlKHRoaXMuYXBwTmFtZSlcbiAgICAgICAgLmRpcmVjdGl2ZSh0aGlzLmRpcmVjdGl2ZXMpXG4gICAgICAgIC5jb250cm9sbGVyKHRoaXMuY29udHJvbGxlcnMpO1xuXG4gICAgICBjb25zb2xlLmxvZygnQm9vdGVkIERpcmVjdGl2ZXMnLCB0aGlzLmRpcmVjdGl2ZXMpO1xuICAgICAgY29uc29sZS5sb2coJ0Jvb3RlZCBDb250cm9sbGVycycsIHRoaXMuY29udHJvbGxlcnMpO1xuXG4gICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5jb25maWcsIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIGFuZ3VsYXIubW9kdWxlKHRoaXouYXBwTmFtZSkuY29uZmlnKGMpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdCb290ZWQgQ29uZmlncycsIHRoaXMuY29uZmlnKTtcblxuICAgICAgLy9JbnN0YW50aWF0ZSBvdXIgUmVnaXN0ZXJlZCBGaWx0ZXJzXG4gICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5maWx0ZXJzLCBmdW5jdGlvbiAoZmlsdGVyRnVuY3Rpb24sIGZpbHRlck5hbWUpIHtcbiAgICAgICAgYW5ndWxhci5tb2R1bGUodGhpei5hcHBOYW1lKS5maWx0ZXIoZmlsdGVyTmFtZSwgZmlsdGVyRnVuY3Rpb24pO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdCb290ZWQgRmlsdGVycycsIHRoaXMuZmlsdGVycyk7XG4gICAgfVxuICB9O1xufVxuIl0sImZpbGUiOiJhbmd1bGFyQm9vdGVyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=

var app = angular.module('MadHatter', ['ui.bootstrap', 'ui.router', 'ngCookies', 'treeControl']);

app.directive('folderModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.folderModel);
            var modelSetter = model.assign;

            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0].path);
                });
            });
        }
    };
}]);
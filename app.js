angular.module('foodjunky', ['ngRoute', 'ngResource'])


//routes
.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'pages/search.html',
            controller: 'homeController'
        })
})

// services

.service('backendService', function($timeout, $q){

    this.fetch = function(message) {
        console.info('Sending AJAX request to backend for...')
        console.info(message)

      var deferred = $q.defer();
        $timeout(function() {
            console.info('Returning results..')
            deferred.resolve(true);
        }, 2000);

      return deferred.promise;
    }
})

.service('resultsFilterService', function(){
    var cuisines = ['Pizza', 'Chinese', 'Mexican', 'American', 'Hamburgers', 'Sushi', 'Indian'];
    var self = this;
    this.keywords = [];
    this.priceRangeFilter = {name: 'Price Range', value: 2, type: "price"};
    this.availableOnly = {name: 'Show Available Only', value: true, type: "available"};
    this.optionsFilter = [
        {name: 'Delivery', value: true, type: "options"},
        {name: 'Pickup', value: true, type: "options"},
        // {name: 'Catering Only', value: false, type: "options"}
    ];
    this.cuisinesFilter = cuisines.map(function(cuisine){
        obj = {};
        obj.value = false;
        obj.name = cuisine;
        obj.type = "cuisine";
        return obj;
    });

    function getTags(cuisinesFilter, priceRangeFilter, optionsFilter, availableOnly, keywords) {
        var tags = [];

        tags.push.apply(tags, optionsFilter);
        tags.push.apply(tags, cuisinesFilter);
        tags.push.apply(tags, keywords);
        if (priceRangeFilter.value) {
            var text = "";
            for (var i = 0; i < priceRangeFilter.value; i++) {
                text += "$";
            };
            text += " & less";
            priceRangeFilter.name = text;

            tags.push(priceRangeFilter);
        };
        if (availableOnly.value) {
            tags.push(availableOnly)
        };


        return tags;
    };

    this.tags = function() {
        return getTags(self.cuisinesFilter, self.priceRangeFilter, self.optionsFilter, self.availableOnly, self.keywords);
    }


})

//controllers

.controller('homeController', ['$scope', 'resultsFilterService', 'backendService',
    function($scope, resultsFilterService, backendService){
        $scope.tags = resultsFilterService.tags();

        $scope.restaurantSort = 'Default';
        $scope.optionsFilter = resultsFilterService.optionsFilter;
        $scope.cuisinesFilter = resultsFilterService.cuisinesFilter;
        $scope.availableFilter = resultsFilterService.availableOnly;

        $scope.$watch('availableFilter', function () {
            $scope.tags = resultsFilterService.tags();
            $scope.loading('Getting search results for all restaurants');
          }, true);

        $scope.$watch('restaurantSort', function () {
            $scope.loading('Getting sorted results for '+$scope.restaurantSort);
          }, true);

        $scope.$watch('optionsFilter', function () {
            $scope.tags = resultsFilterService.tags();
            $scope.loading('Getting search results for new options');
          }, true);

        $scope.$watch('cuisinesFilter', function () {
            $scope.loading('Getting search results for new cuisines');
            $scope.tags = resultsFilterService.tags();
          }, true);

        $scope.submit = function() {
            console.log('searching with keywords');
            $scope.loading('Getting search results for new keywords');
            var keywordsObj = $scope.keywords.split(" ").map(function(word){
                obj = {};
                obj.type = "keyword";
                obj.value = "true";
                obj.name = word;
                return obj
            })

            resultsFilterService.keywords.push.apply(resultsFilterService.keywords, keywordsObj);
            $scope.tags = resultsFilterService.tags();
            $scope.keywords = ""
        };

        //logic to simulate loading
        $scope.loaded = false;
        $scope.loading = function(message) {
            $scope.loaded = false
            return backendService.fetch(message).then(function() {
                $scope.loaded = true
            })
        }
        $scope.loading('Getting search results');

}])

.controller('priceFilterController',['$scope', 'resultsFilterService', 
    function($scope, resultsFilterService){
        $scope.priceRange = [
            {value: 1, hover: false, selected:false},
            {value: 2, hover: false, selected:false},
            {value: 3, hover: false, selected:false},
            {value: 4, hover: false, selected:false},
        ];


        $scope.setPriceValue = function(price) {
            resultsFilterService.priceRangeFilter['value'] = price;
        }

        $scope.priceRangeFilter = resultsFilterService.priceRangeFilter;

        $scope.$watch('priceRangeFilter', function (priceRangeFilter) {
            $scope.setState(priceRangeFilter.value,'selected')
            $scope.loading('Getting search results for new price range');
            $scope.tags = resultsFilterService.tags();
          }, true);

        $scope.setState = function(price,state) {
            if (state == 'selected') {
                $scope.unhover();
                resultsFilterService.tags()
            }

            for (var i = 0; i < $scope.priceRange.length; i++) { 
                if ($scope.priceRange[i].value <= price) {
                    $scope.priceRange[i][state] = true
                } else {
                    $scope.priceRange[i][state] = false
                }
            }


        };

        $scope.unhover = function() {
            for(var i=0; i< $scope.priceRange.length; i++) {
                $scope.priceRange[i].hover = false;
            }
        }
}])

.controller('filterTagsController',['$scope', 
    function($scope){
        $scope.remove = function(tag) {
            console.log(tag.name)
            tag.value = false;
        }

}])


//directives
.directive('priceFilter', function(){
    return {
        scope: false,
        templateUrl: 'directives/priceFilter.html',
        replace: true,
        controller: 'priceFilterController'
    }
})
.directive('filterTags', function(){
    return {
        scope: false,
        templateUrl: 'directives/filterTags.html',
        replace: true,
        controller: 'filterTagsController'
    }
})
.directive('restaurantCard', function(){
    return {
        scope: false,
        templateUrl: 'directives/restaurantCard.html',
        replace: true,
        transclude: true
    }
})

;




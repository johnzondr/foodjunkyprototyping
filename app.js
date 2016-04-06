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
.service('restaurantsService', function($http) {
    this.load = $http.get('/restaurants.json');
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
        {name: 'Catering Only', value: false, type: "options"}
    ];
    this.cuisinesFilter = cuisines.map(function(cuisine){
        obj = {};
        obj.value = false;
        obj.name = cuisine;
        obj.type = "cuisine";
        return obj;
    });


    function toArray(objectsArray){
        var arry = [];
        for (i = 0; i < objectsArray.length; i++) {
            if (objectsArray[i].value) {
                arry.push(objectsArray[i].name)
            }
        };
        
        return arry;
    };

    function getTags(cuisinesFilter, priceRangeFilter, optionsFilter, availableOnly, keywords) {
        var tags = [];

        tags.push.apply(tags, optionsFilter);
        tags.push.apply(tags, cuisinesFilter);
        tags.push.apply(tags, keywords);
        if (priceRangeFilter.value) {
            var text = "";
            for (i = 0; i < priceRangeFilter.value; i++) {
                text += "$";
            };
            text += " & less";

            tags.push(priceRangeFilter);
        };
        if (availableOnly.value) {
            tags.push(availableOnly)
        };


        return tags;
    };

    this.tags = function() {
        //console.log(getTags(self.cuisinesFilter, self.priceRangeFilter, self.optionsFilter, self.availableOnly));
        
        return getTags(self.cuisinesFilter, self.priceRangeFilter, self.optionsFilter, self.availableOnly, self.keywords);
    }


})

//controllers

.controller('homeController', ['$scope', 'resultsFilterService', 'restaurantsService',
    function($scope, resultsFilterService, restaurantsService){
        $scope.tags = resultsFilterService.tags();
        console.log(resultsFilterService.tags());
        restaurantsService.load.then(function(restaurants){
            $scope.restaurants = restaurants.data
        });

        $scope.optionsFilter = resultsFilterService.optionsFilter;
        $scope.cuisinesFilter = resultsFilterService.cuisinesFilter;


        $scope.$watch('optionsFilter|filter:{value:true}', function () {
            $scope.tags = resultsFilterService.tags();
          }, true);

        $scope.$watch('cuisinesFilter|filter:{value:true}', function () {
            $scope.tags = resultsFilterService.tags();
          }, true);

        $scope.submit = function() {
            console.log('searching with keywords');

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

}])

.controller('filterTagsController',['$scope', 
    function($scope){
        $scope.remove = function(tag) {
            console.log(tag.name)
            tag.value = false;
        }

}])


//directives
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
    }
})
.directive('locationList', function(){
    return {
        scope: false,
        templateUrl: 'directives/locationList.html',
        replace: true

    }
})
.directive('stateContainer', function(){
    return {
        scope: {
            stateLocation: '=stateLocation',
            selected:'='
        },
        templateUrl: 'directives/stateContainer.html',
        replace: true,
        controller: 'stateContainerController'
    }
})

;




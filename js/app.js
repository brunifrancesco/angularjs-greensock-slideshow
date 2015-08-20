var app = angular.module('website', ['ngAnimate', 'ui.bootstrap','ngFileUpload']);

app.controller('UploadCtrl', ['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout) {
    $scope.uploadFiles = function(files) {
        $scope.files = files;
        angular.forEach(files, function(file) {
            
            if (file) {
                file.upload = Upload.upload({
                  url: 'http://localhost:5000/addphoto?callback=ciao',
                  file: file
                });
            }
            //     file.upload.then(function (response) {
            //       $timeout(function () {
            //         file.result = response.data;
            //       });
            //     }, function (response) {
            //       if (response.status > 0)
            //         $scope.errorMsg = response.status + ': ' + response.data;
            //     });

            //     file.upload.progress(function (evt) {
            //       file.progress = Math.min(100, parseInt(100.0 * 
            //                                evt.loaded / evt.total));
            //     });
            // }   
        });
    }
}]);
app.service('PhotoService', function ($http) {
    var promise = $http.get('http://localhost:5000/').
    success(function (data) {
        return data;
    });
    return promise;
})

app.controller('MainCtrl', function ($scope, $timeout, QueueService, PhotoService) {
    var INTERVAL = 3000;
        slides = [] ;
        PhotoService.then(function(data){
            loadSlides(data.data);
        });
        //  = [{id:"image00", src:"./images/image00.jpg"},
        // {id:"image01", src:"./images/image01.jpg"},
        // {id:"image02", src:"./images/image02.jpg"},
        // {id:"image03", src:"./images/image03.jpg"},
        // {id:"image04", src:"./images/image04.jpg"}];

    function setCurrentSlideIndex(index) {
        $scope.currentIndex = index;
    }

    function isCurrentSlideIndex(index) {
        return $scope.currentIndex === index;
    }

    function nextSlide() {
        $scope.currentIndex = ($scope.currentIndex < $scope.slides.length - 1) ? ++$scope.currentIndex : 0;
        $timeout(nextSlide, INTERVAL);
    }

    function setCurrentAnimation(animation) {
        $scope.currentAnimation = animation;
    }

    function isCurrentAnimation(animation) {
        return $scope.currentAnimation === animation;
    }

    function loadSlides(data) {
        
        QueueService.loadManifest(data);
    }

    $scope.$on('queueProgress', function(event, queueProgress) {
        $scope.$apply(function(){
            $scope.progress = queueProgress.progress * 100;
        });
    });

    $scope.$on('queueComplete', function(event, slides) {
        $scope.$apply(function(){
            $scope.slides = slides;
            $scope.loaded = true;

            $timeout(nextSlide, INTERVAL);
        });
    });

    $scope.progress = 0;
    $scope.loaded = false;
    $scope.currentIndex = 0;
    $scope.currentAnimation = 'slide-left-animation';

    $scope.setCurrentSlideIndex = setCurrentSlideIndex;
    $scope.isCurrentSlideIndex = isCurrentSlideIndex;
    $scope.setCurrentAnimation = setCurrentAnimation;
    $scope.isCurrentAnimation = isCurrentAnimation;

    
});

app.factory('QueueService', function($rootScope){
    var queue = new createjs.LoadQueue(true);

    function loadManifest(manifest) {
        queue.loadManifest(manifest);

        queue.on('progress', function(event) {
            $rootScope.$broadcast('queueProgress', event);
        });

        queue.on('complete', function() {
            $rootScope.$broadcast('queueComplete', manifest);
        });
    }

    return {
        loadManifest: loadManifest
    }
})

app.animation('.slide-left-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 1, { left: $window.innerWidth}, {left: 0, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {left: -$window.innerWidth, onComplete: done});
        }
    };
});

app.animation('.slide-down-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 1, { top: -$window.innerHeight}, {top: 0, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {top: $window.innerHeight, onComplete: done});
        }
    };
});

app.animation('.fade-in-animation', function ($window) {
    return {
        enter: function (element, done) {
            TweenMax.fromTo(element, 1, { opacity: 0}, {opacity: 1, onComplete: done});
        },

        leave: function (element, done) {
            TweenMax.to(element, 1, {opacity: 0, onComplete: done});
        }
    };
});

app.directive('bgImage', function ($window, $timeout) {
    return function (scope, element, attrs) {
        var resizeBG = function () {
            var bgwidth = element.width();
            var bgheight = element.height();

            var winwidth = $window.innerWidth;
            var winheight = $window.innerHeight;

            var widthratio = winwidth / bgwidth;
            var heightratio = winheight / bgheight;

            var widthdiff = heightratio * bgwidth;
            var heightdiff = widthratio * bgheight;

            if (heightdiff > winheight) {
                element.css({
                    width: winwidth + 'px',
                    height: heightdiff + 'px'
                });
            } else {
                element.css({
                    width: widthdiff + 'px',
                    height: winheight + 'px'
                });
            }
        };

        var windowElement = angular.element($window);
        windowElement.resize(resizeBG);

        element.bind('load', function () {
            resizeBG();
        });
    }
});




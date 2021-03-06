/**
 * オートコンプリートディレクティブ
 * 
 * [属性]
 * selectedItem : コントローラー側と選択した値のバインド用
 * itemList     : リスト表示用のデータ
 * 
 * [使用方法]
 * <auto-complete-directive item-list="trackerList" selected-item="ticketModel.tracker" ></auto-complete-directive>
 * 
 * @module autoCompleteDirective
 * @author niikawa
 */
var myApp = angular.module('myApp');
myApp.directive('autoCompleteDirective', function()
{
    return {
        restrict: 'E',
        scope: {selectedItem: '=', itemList: '=', execute: '&', namePropertie: '@', appendString: '@'},
        template:   '<form class="navbar-form navbar-left"><input ng-show="!isLabel" class="form-control d-complete-input" ng-model="selectName">' +
                    '<span ng-show="isLabel && selectName.length != 0" ng-click="changeElement()">{{appendString}}{{selectName}}</span>' +
                    '<ul class="complete-list" ng-show="isFocus">' +
                    '<li ng-repeat="item in itemList" ng-click="click($event, item)" >' +
                    '{{item[namePropertie]}}' +
                    '</li>' +
                    '</ul></form>',
        replace: true,
        link: function (scope, element, attrs) 
        {
            scope.selectName = '';
            scope.isFocus = false;
            scope.isLabel = false;
            var originList = [];
            scope.$watch('itemList', function(newValue, oldValue)
            {
                if (void 0 !== newValue && void 0 !== oldValue)
                {
                    console.log('watch itemList');
                    if (newValue.length === oldValue.length)
                    {
                        return false;
                    }
                    if (newValue.length > oldValue.length)
                    {
                        originList = angular.copy(newValue);
                    }
                    else if (newValue.length < oldValue.length)
                    {
                        originList = angular.copy(oldValue);
                    }
                }
                else
                {
                    if (void 0 !== scope.itemList)
                    {
                        console.log('set initialize data');
                        angular.copy(scope.itemList, originList);
                    }
                }
            });

            /**
             * 要素のインプットにフォーカが合った場合にリストを表示する
             * 
             * @author niikawa
             */
            element.find('input').on('focus', function()
            {
                scope.$apply(function ()
                {
                    scope.isFocus = true;
                });
            });
            
            /**
             * 要素のインプットからにフォーカが外れた場合にリストを非表示する
             * 
             * @author niikawa
             */
            element.find('input').on('blur', function()
            {
                var hide = setInterval(function(isExist)
                {
                    scope.$apply(function ()
                    {
                        var num = originList.length;
                        var isExist = scope.selectName.length === 0 ? true : false;
                        for (var i = 0; i < num; i++)
                        {
                            if (scope.selectName === originList[i][scope.namePropertie])
                            {
                                isExist = true;
                                break;
                            }
                        }
                        
                        if (isExist)
                        {
                            element.find('input').removeClass('auto-complete-item-error');
                        }
                        else
                        {
                            element.find('input').addClass('auto-complete-item-error');
                        }
                        scope.isFocus = false;
                    });
                    clearInterval(hide);
                }, 300);
            });
            
            /**
             * 入力文字に合致した選択肢を表示する
             * 
             * @author niikawa
             */
            element.find('input').on('keyup', function()
            {
                if (0 === originList.length)
                {
                    angular.copy(scope.itemList, originList);
                }
                var createList = [];

                scope.isFocus = true;
                if (scope.selectName.length === 0)
                {
                    angular.copy(originList, createList);
                }
                else
                {
                    var num = originList.length;
                    for (var i = 0; i < num ; i++)
                    {
                        if (originList[i][scope.namePropertie].indexOf(scope.selectName) !== -1)
                        {
                            createList.push(angular.copy(originList[i]));
                        }
                    }
                }
                scope.$apply(function ()
                {
                    angular.copy(createList, scope.itemList);
                });
            });
            
            /**
             * 選択肢がクリックされた時に実行され、選択したアイテムを
             * selectedItemに格納する
             * 
             * @event click
             * @author niikawa
             * @param {object} $event イベント
             * @param {string} item   選択したアイテム
             */
            scope.click = function ($event, item) 
            {
                //イベントが伝搬しないように制御
                $event.preventDefault();
                $event.stopPropagation();
                
                angular.copy(item, scope.selectedItem);
                element.find('input').removeClass('auto-complete-item-error');
                scope.isFocus = false;
                if (void 0 !== scope.execute)
                {
                    scope.execute();
                }
                scope.isLabel = true;
                scope.selectName = item[scope.namePropertie]; 
            };
            
            /**
             * spanからinputに変更する
             * 
             * @event click
             * @author niikawa
             */
            scope.changeElement = function()
            {
                angular.copy(originList, scope.itemList);
                scope.isLabel = false;
                element.find('input').focus();
            };
        }
    };
});
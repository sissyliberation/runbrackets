'use strict';

describe('Controller: BracketCtrl', function () {

  // load the controller's module
  beforeEach(module('runbracketsApp'));

  var BracketCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BracketCtrl = $controller('BracketCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});

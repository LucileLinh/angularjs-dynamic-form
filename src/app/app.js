import angular from 'angular'
import uirouter from 'angular-ui-router'

import routing from './app.routing'
import AppCtrl from './appCtrl'
import appDirective from './appDirective'

import '../style/app.css'

const MODULE_NAME = 'app'

angular
  .module(MODULE_NAME, [uirouter])
  .config(routing)
  .directive('app', appDirective)
  .controller('AppCtrl', AppCtrl)

export default MODULE_NAME

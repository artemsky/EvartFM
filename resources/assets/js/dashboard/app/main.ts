import * as $ from 'jquery';
require('bootstrap');
module App{
    if(typeof($) !==  "function")
        console.error('Load JQuery')
}
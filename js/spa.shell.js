/*
 * spa.shell.js
 * SPA용 셀 모듈
 */

/* jslint
   browser: true,   continue: true,
   devel: true,     indent: 2,  maxerr: 50,
   newcap: true,    nomen: true,    plusplus: true,
   regexp: true,    sloppy: true,   vars: false,
   white: true
 */

/* global $, spa */

spa.shell = (function () {
    //--------모듈 스코프 변수 시작--------//
    var
        configMap = {
            main_html : String()
                + '<div class="spa-shell-head">'
                    + '<div class="spa-shell-head-logo"></div>'
                    + '<div class="spa-shell-head-acct"></div>'
                    + '<div class="spa-shell-head-search"></div>'
                + '</div>'
                + '<div class="spa-shell-main">'
                    + '<div class="spa-shell-main-nav"></div>'
                    + '<div class="spa-shell-main-content"></div>'
                + '</div>'
                + '<div class="spa-shell-foot"></div>'
                + '<div class="spa-shell-chat"></div>'
                + '<div class="spa-shell-modal"></div>'
        },
        stateMap = {$container : null},
        jqueryMap = {},
        
        setJqueryMap, initModule;
        //--------모듈 스코프 변수 끝--------//
    
        //--------유틸리티 메서드 시작--------//
        //--------유틸리티 메서드 끝--------//
    
        //--------DOM 메서드 시작--------//
        // DOM 메서드 /setJqueryMap/ 시작
            setJqueryMap = function () {
                var $container = stateMap.$container;
                jQueryMap = {$container : $container}  ;
            };
        // DOM 메서드 /setJqueryMap/ 시작
        //--------DOM 메서드 끝--------//
        
        //--------이벤트 핸들러 시작--------//
        //--------이벤트 핸들러 끝--------//
        
        //--------public 메서드 시작--------//
        // publiic 메서드 /initModule/ 시작
        initModule = function ($container) {
            stateMap.$container = $container;
            $container.html(configMap.main_html);
            setJqueryMap();  
        };
        // publiic 메서드 /initModule/ 끝
        
        return {initModule : initModule};
        //--------public 메서드 끝--------//
}());
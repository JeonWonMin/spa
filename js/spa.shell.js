/*
 * spa.shell.js 
 * SPA용 셸 모듈 
 */

/*jslint           browser : true, continue : true,
	devel  : true, indent  : 2,    maxerr   : 50,
    newcap : true, nomen   : true, plusplus : true,
    regexp : true, sloppy  : true, vars     : false,
    white  : true
*/
/*전역 $, spa */

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
                + '<div class="spa-shell-modal"></div>',
            chat_extend_time : 1000,
            chat_retract_time : 300,
            chat_extend_height : 450,
            chat_retract_height : 15,
            chat_extended_title : 'Click to retract',
            chat_retract_title : 'Click to extend'
        },
        stateMap  = {
            $container : null,
            is_chat_retracted : true
        },
        jqueryMap = {},

        setJqueryMap, toggleChat, onClickChat, initModule;
    //--------모듈 스코프 변수 끝--------//

    //--------유틸리티 메서드 시작--------//
    //--------유틸리티 메서드 끝--------//

    //--------DOM 메서드 시작--------//
    // DOM 메서드 /setJqueryMap/ 시작
    setJqueryMap = function () {
        var $container = stateMap.$container;

        jqueryMap = {
            $container : $container,
            $chat : $container.find('.spa-shell-chat')
        };
    };
    // DOM 메서드 /setJqueryMap/ 끝

    // DOM 메서드 /toggleChat/ 시작
    // 목적 : 채팅 슬라이더 영역을 열고 닫는다.
    // 인자 :
    // *do_extend - true면 열고, false면 닫는다.
    // *callback - 애니메이션 종료 시점에 callback 함수를 실행한다.
    // 설정 :
    // *chat_extend_time, chat_retract_time
    // *chat_extend_height, chat_retract_height
    // 반환값 : boolean
    // *true - 슬라이더 애니메이션이 실행된다.
    // *false - 슬라이더 애니메이션이 실행되지 않는다.
    // 상태 : stateMap.is_chat_retracted 값을 설정한다.
    // *true - 슬라이더가 축소된다.
    // *false - 슬라이더가 확장된다.
    //
    toggleChat = function (do_extend, callback) {
        var
            px_chat_ht = jqueryMap.$chat.height(),
            is_open    = px_chat_ht === configMap.chat_extend_height,
            is_closed  = px_chat_ht === configMap.chat_retract_height,  
            is_sliding = ! is_open && ! is_closed;
        
        // 경쟁 조건을 피한다.
        if (is_sliding) {return false;}
    
        // 채팅 슬라이더 확장 시작
        if (do_extend) {
            jqueryMap.$chat.animate(
                {height : configMap.chat_extend_height},
                configMap.chat_extend_time,
                function () {
                    jqueryMap.$chat.attr(
                        'title', configMap.chat_extended_title
                    );
                    stateMap.is_chat_retracted = false;
                    if (callback) {callback(jqueryMap.$chat);}
                }
            );
            return true;
        }
        // 채팅 슬라이더 확장 끝
    
        // 채팅 슬라이더 축소 시작
        jqueryMap.$chat.animate(
            {height : configMap.chat_retract_height},
            configMap.chat_retract_time,
            function() {
                jqueryMap.$chat.attr(
                    'title', configMap.chat_extended_title
                );
                stateMap.is_chat_retracted = true;

                if (callback) {callback(jqueryMap.$chat);}
            }
        );
        return true;
        // 채팅 슬라이더 축소 끝
    };
    // DOM 메서드 /toggleChat/ 끝

    //--------DOM 메서드 끝--------//

    //--------이벤트 핸들러 시작--------//
    onClickChat = function (event) {
        toggleChat(stateMap.is_chat_retracted)
        return false;
    };
    //--------이벤트 핸들러 끝--------//

    //--------public 메서드 시작--------//
    // publiic 메서드 /initModule/ 시작
    initModule = function ($container) {
        // HTML을 로드한 후 제이쿼리 컬랙션 객체를 매핑한다.
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();
        // 채팅 슬라이더 초기화 및 클릭 핸들러 바인딩
        stateMap.is_chat_retracted = true;
        jqueryMap.$chat
            .attr('title', configMap.chat_retracted_title)
            .click(onClickChat);
    };
    // publiic 메서드 /initModule/ 끝

    return {initModule : initModule};
    //--------public 메서드 끝--------//
}());
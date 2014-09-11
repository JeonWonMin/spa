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
            anchor_schema_map : {
                chat : {open : true, closed : true}
            },
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
            chat_extend_time : 250,
            chat_retract_time : 300,
            chat_extend_height : 450,
            chat_retract_height : 15,
            chat_extended_title : 'Click to retract',
            chat_retracted_title : 'Click to extend'
        },
        stateMap  = {
            $container : null,
            anchor_map : {},
            is_chat_retracted : true
        },
        jqueryMap = {},

        copyAnchorMap, setJqueryMap, toggleChat,
        changeAnchorPart, onHashChange,
        onClickChat, initModule;
    //--------모듈 스코프 변수 끝--------//

    //--------유틸리티 메서드 시작--------//
    // 저장된 앵커 맵의 복사본을 반환한다. 이를 통해 연산 부담을 최소화한다.
    copyAnchorMap = function () {
        return $.extend(true, {}, stateMap.anchor_map);
    };
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
    //     * do_extend - true면 열고, false면 닫는다.
    //     * callback - 애니메이션 종료 시점에 callback 함수를 실행한다.
    // 설정 :
    //     * chat_extend_time, chat_retract_time
    //     * chat_extend_height, chat_retract_height
    // 반환값 : boolean
    //     * true - 슬라이더 애니메이션이 실행된다.
    //     * false - 슬라이더 애니메이션이 실행되지 않는다.
    // 상태 : stateMap.is_chat_retracted 값을 설정한다.
    //     * true - 슬라이더가 축소된다.
    //     * false - 슬라이더가 확장된다.
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
                    'title', configMap.chat_retracted_title
                );
                stateMap.is_chat_retracted = true;

                if (callback) {callback(jqueryMap.$chat);}
            }
        );
        return true;
        // 채팅 슬라이더 축소 끝
    };
    // DOM 메서드 /toggleChat/ 끝
    
    // DOM 메서드 /chageAnchorPart/ 시작
    // 목적 : URI 앵커 컴포넌트의 일부 영역 변경
    // 인자 :
    //     * arg_map - URI 앵커 중 변경할 부분을 나타내는 맵
    // 반환값 : boolean
    //     * true - URI의 앵커 부분이 변경됨
    //     * false - URI의 앵커 부분이 변경되지 않음
    // 행동 :
    //     현재 앵커는 stateMap.anchor_map에 저장돼 있다.
    //     인코딩 방식은 uriAnchor를 참고하자.
    //     이 메서드는
    //     * copyAnchorMap()을 사용해 이 맵을 복사한다.
    //     * arg_map을 사용해 키-값을 수정한다.
    //     * 인코딩 과정에서 독립적인 값과 의존적인 값을 서로 구분한다.
    //     * uriAnchor를 활용해 URI 변경을 시도한다.
    //     * 성공 시 true, 실패 시 false를 반환한다.
    changeAnchorPart = function (arg_map) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
            
        // 변경 사항을 앵커 맵으로 합치는 작업 시작
        KEYVAL:
        for (key_name in arg_map) {
            if (arg_map.hasOwnProperty(key_name)) {
                // 반복 과정 중 의존적 키는 건너뜀
                if (key_name.indexOf('_') === 0) {continue KEYVAL;}
                
                // 독립적 키 값을 업데이트
                anchor_map_revise[key_name] = arg_map[key_name];
                
                // 대응되는 의존적 키를 업데이트
                key_name_dep = '_' + key_name;
                if (arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }
                else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }
        // 앵커 맵으로 변경 사항 병합 작업 끝
        
        // URI 업데이트를 시도. 작업이 성공하지 못하면 원래대로 복원
        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        }
        catch (error) {
            // URI를 기존 상태로 대체
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }
        // URI 업데이트 시도 끝
        
        return bool_return;
    };
    // DOM 메서드 /chageAnchorPart/ 끝

    //--------DOM 메서드 끝--------//

    //--------이벤트 핸들러 시작--------//
    // 이벤트 핸들러 /onHashchange/ 시작
    // 목적 : hashchange 이벤트의 처리
    // 인자 :
    //     * event - 제이쿼리 이벤트 객체.
    // 설정 : 없음
    // 반환값 : false
    // 행동 :
    //     * URI 앵커 컴포넌트를 파싱
    //     * 새로운 애플리케이션 상태를 현재 상태와 비교
    //     * 현재 상태와 다를 때만 애플리케이션의 상태를 변경
    //
    onHashchange = function (event) {
        var
            anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed;
            
        // 앵커 파싱을 시도
        try {anchor_map_proposed = $.uriAnchor.makeAnchorMap();}
        catch (error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        
        // 편의 변수
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        
        // 변경된 경우 채팅 컴포넌트 조정을 시작
        if (! anchor_map_previous
            || _s_chat_previous !== _s_chat_proposed
        ) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch (s_chat_proposed) {
                case 'open' :
                    toggleChat(true);
                break;
                case 'closed' :
                    toggleChat(false);
                break;
                default :
                    toggleChat(false);
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        // 변경된 경우 채팅 컴포넌트 조정 끝
        
        return false;
    };
    // 이벤트 핸들러 /onHashchange/ 끝
    
    // 이벤트 핸들러 /onClickChat/ 시작
    onClickChat = function (event) {
        if (toggleChat(stateMap.is_chat_retracted)) {
            $.uriAnchor.setAnchor({
                chat : (stateMap.is_chat_retracted ? 'open' : 'closed')
            });
        }

        changeAnchorPart({
            chat : (stateMap.is_chat_retracted ? 'open' : 'closed')
        });

        return false;
    };
    // 이벤트 핸들러 /onClickChat/ 끝
    
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
        // 우리 스키마를 사용하게끔 uriAnchor를 변경
        $.uriAnchor.configModule({
            schema_map : configMap.anchor_schema_map 
        });
        
        // URI 변경 이벤트를 처리
        // 이 작업은 모든 기능 모듈이 설정 및 초기화된 후에 수행한다.
        // 이렇게 하지 않으면 페이지 로드 시점에 앵커를 판단하는 데 사용되는
        // 트리거 이벤트를 모듈에서 처리할 수 없게 된다.
        //
        $(window)
            .bind('hashchange', onHashchange)
            .trigger('hashchange');
    };
    // publiic 메서드 /initModule/ 끝

    return {initModule : initModule};
    //--------public 메서드 끝--------//
}());
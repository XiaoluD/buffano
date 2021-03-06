/**
 * User: chenhua
 * Date: 14-3-29
 * Time: 上午11:05
 * To change this app use File | Settings | File app.
 */

/*当前播放场景ID*/
var scenesId = 0;

/*布局*/
var gridster;

(function($){
    $.fn.templet = function(options) {
        $.fn.templet.defaults = {
            /*当前对象*/
            obj : {},
            /*当前播放场景*/
            curPlayScenes : {},
            /*当前播放场景ID*/
            curPlaySid : -1,
            /*当前播放任务ID*/
            curPlayTaskIds : [],
            /*当前播放部件类型*/
            widgetTypeArray: [],
            /*是否开启debug*/
            debug: true,
            /*是否开启视频播放器接口*/
            enableIa : false,
            monitor: '',
            /*支持的分辨率列表*/
            screenList : ['1920*1080', '1080*1920','1366*768', '1280*720', '1024*600'],
            /*布局配置*/
            'settings': {
                '1920*1080': {
                    'width':1920,
                    'height':1080,
                    'widget_margins': [0, 0],
                    'widget_base_dimensions': [160, 90],
                    'min_cols': 12
                },
                '1080*1920': {
                    'width':1080,
                    'height':1920,
                    'widget_margins': [0, 0],
                    'widget_base_dimensions': [90, 160],
                    'min_cols': 12
                },
                '1366*768': {
                    'width':1366,
                    'height':768,
                    'widget_margins': [0, 0],
                    'widget_base_dimensions': [225.66, 126],
                    'min_cols': 6
                },
                '1280*720': {
                    'width':1280,
                    'height':720,
                    'widget_margins': [0, 0],
                    'widget_base_dimensions': [128, 120],
                    'max_cols': 10,
                    'max_rows': 6
                },
                '1024*600': {
                    'width':1024,
                    'height':600,
                    'widget_margins': [0, 0],
                    'widget_base_dimensions': [128, 120],
                    'max_cols': 8,
                    'max_rows': 5
                }
            },
            widgetW : 0,
            widgetH: 0,
            /*客户端心跳频率,每分钟一次*/
            rateTime : 1000*5,//1000*60
            /*加载数据*/
            getJson : function(){
                 if(programs == undefined || programs == '')  {
                       opts._debug("加载的数据不能为空!");
                       return false;
                 }
            },

            _debug:function(msg){
                if (opts.debug) {
                    if (typeof(console) != "undefined") console.log(msg);
                    else alert(msg);
                }
            },

            /*加载垫底节目*/
            loadTemp : function() {
                var ws = window.screen.width;
                var hs = window.screen.height;
                var tempFileName = '';
                if(contains(opts.screenList, ws+'*'+hs) != -1) {
                    tempFileName = 'p_'+ws+'_'+hs+'.js';
                } else {
                    tempFileName = 'p_'+1280+'_'+720+'.js';
                }
                opts._debug('加载的垫底节目是：'+'data/temp/'+tempFileName);
                Utils.loadFile('data/temp/'+tempFileName, function() {
                    opts.switchScenes();
                });
                return false;
            },

            /*播放节目警告*/
            warn : function() {
                setTimeout(function() {
                    var width = $('body').width();
                    $('body').append('<div class="alert alert-info marquee-with-options">当前时间不在节目单定义的时间范围，请在管理平台重新编辑节目并发布！</div>');
                    $('.marquee-with-options').css({
                        width: '300px',
                        top : (Tool.Browser('height')/2 - 70) + 'px',
                        left : (window.document.body.offsetWidth/2 - 150) + 'px'
                    }).marquee({
                        speed: 5000,
                        gap: 50,
                        delayBeforeStart: 0,
                        direction: 'left',
                        duplicated: true,
                        pauseOnHover: true
                    });
                    /*播放背景音乐*/
                    Utils.play('upload/temp/bg.mp3');
                }, 800);
            },

            /*初始化*/
            init : function() {
                JavaVideo.initialize(opts.enableIa);
                opts.handlerData();
            },

            handlerData : function() {
                if(typeof programs === 'undefined' || programs == '')  {
                    opts.loadTemp();
                    opts._debug("加载的数据不能为空!");
                    return false;
                }
				// 当前时间
				var nowTme = Math.round(new Date().getTime()/1000);
				// 检测节目播放是否过期
				if(nowTme < programs['time_start'] || nowTme > programs['time_end']) {
                    opts.loadTemp();
                    opts.warn();
                    return false;
				}
                opts.switchScenes();
                if($.isEmptyObject(opts.curPlayScenes)) {
                    opts.loadTemp();
                    opts.warn();
                   if(opts.monitor) {
                       clearInterval(opts.monitor);
                   }
                   return false;
                }
            },

            /*改变节目之前回调的函数*/
            _before_changeScenes : function() {
                /*关闭视频窗口*/
                JavaVideo.movieViewClose();
            },

            /*切换场景*/
            switchScenes : function() {
                var nowTme = Math.round(new Date().getTime()/1000);
                if($.isEmptyObject(programs['scenes'])) {
                    opts._debug("scenes当前没有播放的内容！");
                    return false;
                }
                var scenes =  programs['scenes'];
                $.each(scenes, function(key, item) {
                    var startTime = item.time_start;
                    var endTime = item.time_end;
                    opts._debug("当前时间="+new Date().format()+";开始时间="+new Date(startTime*1000).format()+";结束时间："+new Date(endTime*1000).format());
                    if(startTime <= nowTme && nowTme <= endTime) {
                        opts._debug("当前播放场景时间---当前时间="+new Date().format()+";开始时间="+new Date(startTime*1000).format()+";结束时间："+new Date(endTime*1000).format());
                        /*如果不是当前播放的场景则切换播放场景*/
                        if(item.id != opts.curPlaySid || opts.curPlaySid < 0) {
                            opts._before_changeScenes();
                            /*标记当前播放场景ID*/
                            opts.curPlayScenes =  item;
                            opts.curPlaySid = item.id;
                            switch (item.mode) {
                                case  'link' :
                                    links.initialize();
                                    links.push(item['play_task']['widget_0']);
                                    return false;
                                    break;
                                default  :
                                    opts.makeGrid(item.widget, programs.screen);
                            }
                        }
                        if(item.mode != 'link') {
                            /*加载播放任务*/
                            opts.loadPlayTask(item.widget, item.play_task);
                            return true;
                        }
                    }
                });
                return true;
            },

            /*加载播放任务*/
            loadPlayTask : function(widget, playTaskList) {
                if($.isEmptyObject(playTaskList)) {
                    return false;
                }
                var nowTme = Math.round(new Date().getTime()/1000);
                $.each(widget ,function(key, item) {
                    var curPlayTask = {};
                    /*如果是时间或天气不需要切换内容*/
                    if((item.type == 'time' || item.type == "weather")) {
                        if(opts.curPlayTaskIds[key] == undefined) {
                            opts.curPlayTaskIds[key] = 0; /*标记任务ID为0，代表已经加载了*/
                            /*生成部件播放内容*/
                            opts.buildWidgetContent(item, item.type, curPlayTask);
                        }
                    } else {
                        var widgetPrimKey = "widget_"+item.id;
                        var wgPlayList = playTaskList[widgetPrimKey];
                        var isStartPlay = false;
                        if(!$.isEmptyObject(wgPlayList)){
                            $.each(wgPlayList, function(i, playTask) {
                                var startTime = playTask.time_start;
                                var endTime = playTask.time_end;
                                if(startTime <= nowTme && nowTme <= endTime && !isStartPlay) {
                                    if(playTask.taskId != opts.curPlayTaskIds[key] ) {
                                        curPlayTask = playTask;
                                        opts.curPlayTaskIds[key] = playTask.taskId;
                                        isStartPlay = true;
                                    }
                                }
                            });
                        }
                        /*查询播放列表*/
                        if($.isEmptyObject(curPlayTask)){
                            opts._debug("widget_"+item.id+"当前没有播放的任务或不用切换新的播放任务！");
                        }  else {
                            var playList = null;
                            var playListPrimKey = curPlayTask['play_list'];
                            var playList = opts.curPlayScenes['play_list'][playListPrimKey];
                            /*生成部件播放内容*/
                            opts.buildWidgetContent(item, item.type, playList);
                        }
                    }
                });
                /*opts._debug(opts.curPlayTaskIds);*/
                return true;
            },

            /*
             * 生成部件的播放内容
             * @param widget: 部件对象
             * @param type: 部件类型
             * @param plays: 播放对象
             * */
            buildWidgetContent : function(widget, type, plays) {
                 var $widgetId = $("#widget_"+widget['id']);
                 var widgetDivId = "widget_div_"+widget['id'];
                 var width = parseFloat(widget['size_x']*opts.widgetW), height = parseFloat(widget['size_y']*opts.widgetH);
                 opts._debug(widget['type']+":w="+width+";h="+height);
                 var widgetHtml = '';
                 switch (widget['type']) {
                     case "slide" :
                         opts.switchSlide($widgetId, widgetDivId, width, height, plays);
                         break;
                     case "video" :
                         opts.switchVideo($widgetId, plays);
                         break;
                     case "image" :
                         opts.switchImage($widgetId, widgetDivId, width, height, plays);
                         break;
                     case "text" :
                         opts.switchText($widgetId, widgetDivId, width, height, plays);
                         break;
                     case "time" :
                         widgetHtml += '<div  id="'+widgetDivId+'" style="width:'+width+'px; height:'+height+'px; "></div>';
                         $widgetId.empty().append(widgetHtml);
                         $('#'+widgetDivId).times({'css':'time_2',width: width, height: height});
                         break;
                     case "weather" :
                         widgetHtml += '<div id="'+widgetDivId+'" style="width:'+width+'px; height:'+height+'px;"></div>';
                         $widgetId.empty().append(widgetHtml);
                         $('#'+widgetDivId).weather({'css':'style_2'});
                         break;
                 }
            },

            switchSlide : function($widgetId, widgetDivId, width, height, plays) {
                if($.isEmptyObject(plays)) {
                    return false;
                }
                var widgetHtml = '';
                widgetHtml += '<div id="'+widgetDivId+'" style="width:'+width+'px; height:'+height+'px;overflow: hidden">';
                $.each(plays.lists, function(key, lists) {
                    if(JavaVideo.fileExist(lists.url)) {
                        widgetHtml +='<img src="'+lists.url+'" width="'+width+'" height="'+height+'" title="'+lists.text+'"/>';
                    }
                });
                widgetHtml += '</div>';
                $widgetId.empty().append(widgetHtml);
                /*加载图片切换*/
                $("#"+widgetDivId).bxSlider({
                    auto: true,
                    autoControls: false, //自动滚动的控制键
                    controls: false,   //隐藏左右按钮
                    pager:false, //display a pager
                    useCSS:false,
                    captions: false //是否显示图片的标题，读取图片的title属性的内容。
                });
            },

            switchVideo : function($widgetId, plays) {
                if($.isEmptyObject(plays)) {
                    return false;
                }
                /*关闭视频窗口*/
                JavaVideo.movieViewClose();
                var widgetHtml = '';
                widgetHtml += '<div>';
                widgetHtml += '</div>';
                $widgetId.empty().append(widgetHtml);

                var $offset, playlist = [];
                $offset = $widgetId.position();
                opts._debug("播放列表:"+plays.lists);
                $.each(plays.lists, function(key, lists) {
                    playlist.push({"file" : lists.url});
                });
                opts._debug("x="+$offset.left+",y="+ $offset.top+",width="+$widgetId.width()+", height="+$widgetId.height());
                console.log(JSON.stringify(playlist));
                JavaVideo.moviewViewSetPlayListJsonString(JSON.stringify(playlist));

                JavaVideo.movieViewPrepare($offset.left, $offset.top, $widgetId.width(), $widgetId.height() );
                var startPlay = setInterval(function() {
                    if(JavaVideo.getMovieViewPrepareStatus()) {
                        JavaVideo.movieViewStarPlay(true);
                        clearInterval(startPlay);
                    }
                },1000);
                window.startPlay;
            },

            switchText : function($widgetId, widgetDivId, width, height, plays) {
                if($.isEmptyObject(plays.lists)) {
                    Utils.warn("很抱歉,当前广告位内容正在建设中", {consoleId: $widgetId});
                    return false;
                }
                var widgetHtml = '';
                widgetHtml += '<div class="newswrapper" style="width:'+width+'px; height:'+height+'px; ">' +
                    '<div class="news-list" id="quotation"><ul>';
                $.each(plays.lists, function(j, lists) {
                    widgetHtml +='<li>"'+lists.text+'"</li>';
                });
                widgetHtml += '</ul></div></div>';
                $widgetId.empty().append(widgetHtml);
                $("#quotation ul").find("li").removeClass("gs-w");/*去掉布局插件生成的样式*/
                $("#quotation").textScroll();
            },

            switchImage : function($widgetId, widgetDivId, width, height, plays) {
                if($.isEmptyObject(plays)) {
                    return false;
                }
                var widgetHtml = '';
                widgetHtml += '<div id="'+widgetDivId+'">';
                $.each(plays.lists, function(key, file) {
                    widgetHtml +='<img src="'+file.url+'" width="'+width+'" height="'+height+'" title="'+file.text+'"/>';
                });
                widgetHtml += '</div>';
                $widgetId.empty().append(widgetHtml);
            },

            /*生成网格*/
            makeGrid : function(widgetList, screen) {
                var html= '';
                html += '<div class="gridster" id="gridster"><ul>';
                $.each(widgetList, function(index, widget){
                    html += '<li id="widget_'+widget.id+'" style="overflow: hidden"' +
                        'data-row="'+widget.row+'" data-col="'+widget.col+'" data-sizex="'+widget.size_x+'" data-sizey="'+widget.size_y+'" >';
                    html += '</li>';
                });
                html += '</ul></div>';
                $("body").empty().append(html);

                /*设置布局整体宽度和高度*/
                var screenArray = screen.split('*');
                var gW = screenArray[0];
                var gH = screenArray[1];
                $("#gridster").width(gW).height(gH);
                opts._debug(gW+'*'+gH);
               /* opts._debug(html);*/
                /*初始化播放列表内容数组的大小*/
                opts.curPlayIds = new Array(widgetList.length);

                /*读取部件单元格的W和H*/
                opts.widgetW = opts.settings[screen]['widget_base_dimensions'][0];
                opts.widgetH = opts.settings[screen]['widget_base_dimensions'][1];

                var settings = $.extend({},{
                    widget_base_dimensions: [214, 120],
                    min_cols: 6,
                    min_rows:6,
                    widget_margins: [0, 0],
                    autogrow_cols: true,
                    resize: {
                        enabled: true
                    }
                },opts.settings[screen]);
                /*加载布局*/
                gridster = $("#gridster ul").gridster(settings).data('gridster');
                /*前台显示禁止拖动*/
                gridster.disable();
            }
        };
        /*继承传入的设置参数*/
        var opts = $.extend({}, $.fn.templet.defaults, options);

        return this.each(function(){
            opts.obj = $(this);
            opts.init();
            opts._debug(getInfo());
            /*执行监听*/
            opts.monitor = window.setInterval(opts.handlerData,opts.rateTime);
            opts.monitor;
        })
    }
})(jQuery);

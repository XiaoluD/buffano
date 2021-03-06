/*基础JS*/
var Tool = (function($) {
    return {
        /*启动*/
        'Browser': function(argv) {
            /*判断浏览器类型*/
            var browserSys = {};
            var browserType;
            var browserUa = navigator.userAgent.toLowerCase();
            var s;
            (s = browserUa.match(/msie ([\d.]+)/)) ? browserSys.ie = s[1] :
                (s = browserUa.match(/firefox\/([\d.]+)/)) ? browserSys.firefox = s[1] :
                    (s = browserUa.match(/chrome\/([\d.]+)/)) ? browserSys.chrome = s[1] :
                        (s = browserUa.match(/opera.([\d.]+)/)) ? browserSys.opera = s[1] :
                            (s = browserUa.match(/version\/([\d.]+).*safari/)) ? browserSys.safari = s[1] : 0;

            if (browserSys.ie) {
                browserType = 'IE';
                browserTypeSys = browserSys.ie;
            }
            if (browserSys.firefox) {
                browserType = 'Firefox';
                browserTypeSys = browserSys.firefox;
            }
            if (browserSys.chrome) {
                browserType = 'Chrome';
                browserTypeSys = browserSys.chrome;
            }
            if (browserSys.opera) {
                browserType = 'Opera';
                browserTypeSys = browserSys.opera;
            }
            if (browserSys.safari) {
                browserType = 'Safari';
                browserTypeSys = browserSys.safari;
            }
            var browser_type = browserType + browserTypeSys;
            /*获取浏览器高度*/
            var height = 0;
            if(browserType == 'IE')	{
                height = document.compatMode == "CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
            } else {
                height = self.innerHeight;
            }
            /*获取浏览器宽度*/
            var width = 0;
            if(browserType == 'IE') {
                width = document.compatMode == "CSS1Compat"? document.documentElement.clientWidth : 	document.body.clientWidth;
            } else {
                width = self.innerWidth;
            }
            switch(argv) {
                case 'type':return browserType;break;
                case 'ver':return browserTypeSys;break;
                case 'height':return height;break;
                case 'width':return width;break;
                default:
                    return {
                        'type' : browserType,
                        'ver' : browserTypeSys,
                        'height' : height,
                        'width' : width
                    }
                    break;
            }
        },

        /*
         * 判断值是否在数组中
         * needle    值
         * haystack  数组
         */
        'in_array': function(needle, haystack) {
            if(typeof needle == 'string' || typeof needle == 'number') {for(var i in haystack) {if(haystack[i] == needle) {return true;}}}
            return false;
        }
    };
})(Tool);
/**
 * 模块工具类，用来初始化各模块视图、自定绑定事件以及其他辅助功能等
 *
 * @class Utils
 */
var Utils = {
    _set:{
        debug:true
    },
    debug:function(msg){
        if (this._set.debug) {
            if (typeof(console) != "undefined") console.log(msg);
            else alert(msg);
        }
    },
    /*将警告信息输出到页面*/
    warn : function(msg, options) {
        var opts = $.extend({
            'consoleId' : $("body")
        },options);
        if(typeof opts.consoleId == 'object') {
            var  $consoleId = opts.consoleId;
            $consoleId.append("<div class='alert alert-info' ><h4>"+msg+"</h4></div>");
        }
    },
    /*加载文件*/
    _loadedFile: function() {
        var temp = new Array();
        var tempMethod = function(url, callback) {
            // 第二次调用的时候就不=0了
            var flag = 0;
            for(i in temp) {
                if(temp[i] == url) {
                    flag = 1;
                }
            }
            if(flag == 0) {
                // 未载入过
                temp[temp.length] = url;
                // JQuery的ajax载入文件方式，如果有样式文件，同理在此引入相关样式文件
                $.getScript(url, function() {
                    if("undefined" != typeof(callback)) {
                        if("function" == typeof(callback)) {
                            callback();
                        } else {
                            eval(callback);
                        }
                    }
                });
            } else {
                if("undefined" != typeof(callback)) {
                    // 利用setTimeout 避免未定义错误
                    setTimeout(callback, 200);
                }
            }
        };
        // 返回内部包函数，供外部调用并可以更改temp的值
        return tempMethod;
    },
    _loadCss : function() {
        var temp = new Array();
        var tempMethod = function(url) {
            // 第二次调用的时候就不=0了
            var flag = 0;
            for(i in temp) {
                if(temp[i] == url) {
                    flag = 1;
                }
            }
            if(flag == 0) {
                // 未载入过
                temp[temp.length] = url;
                var css = '<link href="'+url+'" rel="stylesheet" type="text/css">';
                $('head').append(css);
            }
        };
        // 返回内部包函数,供外部调用并可以更改temp的值
        return tempMethod;
    },
    play : function(url) {
        var audio = document.createElement('audio');
        var source = document.createElement('source');
        source.type = "audio/mpeg";
        source.type = "audio/mpeg";
        source.src = url;
        source.autoplay = "autoplay";
        source.controls = "false";
        audio.appendChild(source);
        audio.play();
    }
};

//加载文件，支持回调函数 调用方式Utils.loadFile(url,callback)
Utils.loadFile = Utils._loadedFile();
Utils.loadCss = Utils._loadCss();

/**
 * 格式化时间
 *
 * @param format
 */
Date.prototype.format = function(format) {
    if (!format) {
        format = "yyyy-MM-dd hh:mm:ss";
    }
    var o = {
        "M+": this.getMonth() + 1,
        // month
        "d+": this.getDate(),
        // day
        "h+": this.getHours(),
        // hour
        "m+": this.getMinutes(),
        // minute
        "s+": this.getSeconds(),
        // second
        "q+": Math.floor((this.getMonth() + 3) / 3),
        // quarter
        "S": this.getMilliseconds()
        // millisecond
    };

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

/**
 * 数组操作函数。判断元素是否存在于数组中
 *
 * @param value
 *            判断值
 * @returns {Number} 如果存在返回元素下标，不存在返回-1
 */
function contains(myArray, value) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i] === value) {
            return i;
        }
    }
    return -1;
};

/*检测字符串是不是时间格式*/
function CheckDate(strDate){
    if(strDate.length>0){
        var reg = /^(\d)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
        if(!reg.test(strDate)){
            return false;
        }
    }
    return true;
}

/*字符串转换为时间*/
function jsCovTime(nS, isTimestamp){
    var strTime;
    if(isTimestamp) {
        strTime = new Date(parseInt(nS, 10) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, "");
    }  else {
        strTime =  nS;
    }
    /*console.log(strTime);*/
    if(CheckDate(strTime)) {
        return false;
    }
    var strDateTemp = strTime.split(" ");
    var arrStrDate = strDateTemp[0].split("-");
    var arrStrTime = strDateTemp[1].split(":");
    var allStrDate = new Date(arrStrDate[0],arrStrDate[1],arrStrDate[2],arrStrTime[0],arrStrTime[1],arrStrTime[2]);
    return allStrDate.getTime();
}

/**
 * 时间显示插件
 *
 * @param options
 */
(function($) {
    function initArray() {
        for(i=0;i<initArray.arguments.length;i++) {
            this[i] = initArray.arguments[i];
        }
    }
    $.extend({
        getFullYear : function(d) {
            yr = d.getYear();
            if(yr<1000) {
                yr += 1900;
            }
            return yr;
        },
        nowTime : function($time) {
            var isnMonths = new initArray("01","02","03","04","05","06","07","08","09","10","11","12");
            var isnDays   = new initArray("星期日","星期一","星期二","星期三","星期四","星期五","星期六","星期日");
            today = new Date();
            hrs = today.getHours();
            min = today.getMinutes();
            sec = today.getSeconds();
            clckh = "" + ((hrs>12) ? hrs-12 : hrs );
            clckm = ((min<10)?"0":"") + min; clcks = ((sec<10)?"0":"") + sec;
            clck  = (hrs>=12) ? "下午" : "上午" ;
            var stnr = "";
            var ns   = "0123456789";
            var a    = "";
            $time.html($.getFullYear(today)+"."+isnMonths[today.getMonth()]+"."
                +today.getDate()+"<br/>"+isnDays[today.getDay()]+"<br/><span id='clock'></span>"
                +"");
            $.setClock();
        },
        setClock: function(){
            var Digital = new Date();
            var hours   = Digital.getHours();
            var minutes = Digital.getMinutes();
            var seconds = Digital.getSeconds();
            if(minutes<=9)
                minutes = "0" + minutes;
            if(seconds<=9)
                seconds = "0" + seconds;
            clock = "" + hours + ":" + minutes + ":" + seconds + "";
            $("#clock").html(clock);
            setTimeout($.setClock,1000);
        }
    });
})(jQuery);

/**
 * 文字单行滚动插件
 *
 * @param options
 */
(function ($) {
    $.fn.textScroll = function (options) {
        //默认配置
        var defaults = {
            obj : {},/*当前对象*/
            speed: 500,  /*滚动速度,值越大速度越慢*/
            autoScroll : function() {
                var $ul = opts.obj.find("ul:first");
                var liHeight = $ul.find("li:last").height();
                $ul.animate({
                    marginTop:"-"+liHeight + "px"
                }, opts.speed, function(){
                    $(this).css({marginTop:"0px"}).find("li:first").appendTo(this);
                });
            }
        };
        var opts = $.extend({}, defaults, options);
        this.each(function (i) {
            opts.obj = $(this);
            window.setInterval(opts.autoScroll, 3000);
        });
    }
})(jQuery);

/**
 * 视频播放插件
 *
 * @param options
 */
var JavaVideo =  (function ($) {
    return {
        /*是否开启视频播放器接口*/
        enableIa : false,

        /*
         * 准备打开视频前的第一步设置
         * @param x，y:视频窗口位置坐标
         * @param width, height:视频窗口长和宽
         * */
        movieViewPrepare : function(x, y, width, height){
            this.enableIa && window.ia.movieViewPrepare(x, y, width, height);
        },

        /*
         * 启动开始播放视频
         *
         * @param autoPlayList:是否自动轮流播放播单里面的视频，如果为flale，当前视频播放完毕后将停止播放
         * */
        movieViewStarPlay : function(autoPlayList) {
            this.enableIa && window.ia.movieViewStarPlay(autoPlayList);
        },

        moviewViewSetPlayListJsonString : function(jsonString) {
            this.enableIa && window.ia.moviewViewSetPlayListJsonString(jsonString);
        },

        /*
         * 获取视频窗口准备状态
         * 准备好了才播放：true为准备好了
         * */
        getMovieViewPrepareStatus : function() {
            if(this.enableIa) {
                return window.ia.getMovieViewPrepareStatus();
            } else {
                return true;
            }
        },

        /*
         * 更新播放窗口的大小
         * @param width, height:播放窗口的长和宽
         * */
        updateViewSize : function(width, height) {
            this.enableIa && window.ia.updateViewSize(width, height);
        },

        /*
         * 更新播放窗口的位置
         *
         * param x,y:播放窗口的位置坐标
         * */
        updateViewPosition : function(x, y) {
            this.enableIa && window.ia.updateViewPosition(x, y);
        },

        /*
         * 关闭视频窗口
         * */
        movieViewClose : function() {
            this.enableIa && window.ia.movieViewClose();
        },

        /*
         * 判断文件是否存在
         * @param filePath : 文件路径，可以是文件或者文件夹
         * */
        fileExist : function(filePath) {
            if(this.enableIa) {
               return window.ia.fileExist(filePath);
            }  else {
                return true;
            }
        },

        initialize : function(enableIa) {
            JavaVideo.enableIa = enableIa;
        }
    }
})(jQuery);

function getInfo(){
    var s = "";
    s += " 网页可见区域宽："+ document.body.clientWidth+"\n";
    s += " 网页可见区域高："+ document.body.clientHeight+"\n";
    s += " 网页可见区域宽："+ document.body.offsetWidth + " (包括边线和滚动条的宽)"+"\n";
    s += " 网页可见区域高："+ document.body.offsetHeight + " (包括边线的宽)"+"\n";
    s += " 网页正文全文宽："+ Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)+"\n";
    s += " 网页正文全文高："+ Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)+"\n";
    s += " 网页被卷去的高(ff)："+ document.body.scrollTop+"\n";
    s += " 网页被卷去的高(ie)："+ document.documentElement.scrollTop+"\n";
    s += " 网页被卷去的左："+ document.body.scrollLeft+"\n";
    s += " 网页正文部分上："+ window.screenTop+"\n";
    s += " 网页正文部分左："+ window.screenLeft+"\n";
    s += " 屏幕分辨率的高："+ window.screen.height+"\n";
    s += " 屏幕分辨率的宽："+ window.screen.width+"\n";
    s += " 屏幕可用工作区高度："+ window.screen.availHeight+"\n";
    s += " 屏幕可用工作区宽度："+ window.screen.availWidth+"\n";
    s += " 你的屏幕设置是 "+ window.screen.colorDepth +" 位彩色"+"\n";
    s += " 你的屏幕设置 "+ window.screen.deviceXDPI +" 像素/英寸"+"\n";
    return s;
}

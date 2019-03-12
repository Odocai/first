// 动画插件
(function($, window, document, undefined) {
    var $window = $(window);
    $.fn.flap = function(options){
        // data-delay、data-ani
        var elements = this;
        var $container;
        var settings = {
            threshold: 0,
            container: window,
            event    : "scroll",
        };
        if(options){
            $.extend(settings, options);
        }
        function update(){
            elements.each(function() {
                var $this = $(this);
                if ($.abovethetop(this, settings)) {

                } else if (!$.belowthefold(this, settings)) {
                    $this.trigger("appear");
                }
            });
        }

        $container = (settings.container === undefined ||
                          settings.container === window) ? $window : $(settings.container);
        
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        elements.each(function() {
            var self = this;
            var $self = $(self);
            self.loaded = false;

            $self.on('appear', function() {
                if (!self.loaded) {
                    var _delay = $self.attr('data-delay');
                    var _ani = $self.attr('data-ani');
                    self.loaded = true;
                    $self.css({
                        'visibility': 'visible',
                        'animation-delay': _delay, 
                        '-moz-animation-delay': _delay, 
                        '-webkit-animation-delay': _delay, 
                        'animation-name': _ani,
                        '-moz-animation-name': _ani,
                        '-webkit-animation-name': _ani
                    });
                }
            });
        });

        $window.bind("resize", function() {
            update();
        });

        $(document).ready(function() {
            update();
        });

        return this;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };
    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };
})(jQuery, window, document);


// 解决不支持placeholder属性
function JPlaceHolder($container){
    this.container = $container || $('body');
    this.init();
}
JPlaceHolder.prototype = {
    _check : function(){
        return 'placeholder' in document.createElement('input');
    },
    init : function(){
        if(!this._check()){
            this.fix();
        }
    },
    fix : function(){
        this.container.find('input[placeholder],textarea[placeholder]').each(function(index, element) {
            var self = $(this), txt = self.attr('placeholder');
            self.val(txt);
            self.focusin(function(e) {
                var _this = $(this);
                if(_this.val() == txt){
                    _this.val('');  
                }
            }).focusout(function(e) {
                var _this = $(this);
                if(_this.val() == ''){
                    _this.val(txt)  
                }
            });
        });
    }
};

// 正则
var Reg = {
    email: /^(\w-*\.*)+@(\w-?)+(\.\w{1,})+$/, // 邮箱
    password: /^.{6,20}/,                      // 密码      
    code: /^.{4}$/,                             // 验证码
    checkCode: /^.{4}$/,                        // 校验码
    tel: /(^1[0-9]{10}$)|(^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,8}$)/, // 联系方式
    companyName: /^.{1,50}$/,                   // 公司名称
    name: /^.{1,50}$/,                   // 姓名
    message: /^.{1,500}$/,                   // 留言内容
    position: /.{0,50}$/                       // 部门/职位
};


// 获取对象的属性。 obj为对象； attrStr 为属性字符串
var GetAttr = function(obj,attrStr) {
    if(obj == undefined || attrStr == undefined){
        return "";
    }
    try{
        var result = eval("obj." + attrStr);
        if( result == undefined){
            return "";
        }
        return result;
    } catch(ex) {
        return "";
    }
};

// 验证内容
var valiContent = function(name, $box){
    var $box =  $box.find('.popbox-con');
    var $item =  $box.find('input[name='+name+']');
    if($item.length == 0){
        $item =  $box.find('textarea[name='+name+']');
    }
    var $tip = $item.closest('.popbox-inputbox').find('.popbox-input-tip');
    var regName = $item.attr('data-reg');
    var tip = $item.attr('data-tip');
    $tip.hide();
    if($item.attr('type') == 'checkbox'){
        var val = $item.prop("checked") ? 1 : 0;
    }else{
        var val = $.trim($item.val());
    }
    if(regName == 'cfmPassword'){
        if(val !== $box.find('input[name="password"]').val()){
            $tip.html(tip).show();
            return false;
        }
    }else if($item.attr('type') == 'checkbox'){
        if(!val){
            $tip.html(tip).show();
            return false;
        }
    }else{
        var reg = Reg[regName];
        if(!reg.test(val)){
            $tip.html(tip).show();
            return false;
        }
    }
    return val;
};

// 验证
var valiDation = function(data, $box){
    if($.isArray(data)){
        var obj = {};
        var flag = true;
        for (var i = data.length - 1; i >= 0; i--) {
            var _data = data[i];
            obj[_data] = valiContent(_data, $box);
            if(obj[_data] === false){
                flag = false;
            }
        };
        if(flag){
            return obj;
        }else{
            return false;
        }
    }else{
        valiContent(data, $box);
    }  
};

// 60秒倒计时
var countDown = function(self){
    self.addClass('cur');
    self.html('60秒后获取');
    var _time = 60;
    var intTime = setInterval(function(){
        _time -= 1;
        if(_time == 0){
            clearInterval(intTime);
            intTime = null;
            self.html('点击获取验证码').removeClass('cur');
            return;
        }
        self.html(_time + '秒后获取');
    }, 1000);
};

// 提示弹框
var setTipPop = function(text, timer, type){
    var timer = timer || 2600;
    var className = 'tip-pop err-pop';
    if(type){
        className = 'tip-pop';
    }
    var tipPop = $('<div class="'+className+'">'+text+'</div>');
    tipPop.appendTo('body');
    var _w = tipPop.innerWidth();
    var _h = tipPop.innerHeight();
    tipPop.css({
        marginTop: -_h/2,
        marginLeft: -_w/2
    });
    tipPop.animate({opacity: 1}, 600);
    setTimeout(function(){
        tipPop.animate({opacity: 0}, 600, function(){
            tipPop.remove();
        });
    }, timer);
};

// 设置Main最小高度
var setMinHeight = function(){
    var _wh = $(window).outerHeight();
    var _hh = $('.header').outerHeight();
    var _fh = $('.footer').outerHeight();
    var min_h = _wh - _hh - _fh;
    $('.main').css('min-height', min_h + 'px');
};

// 登录注册类弹框
var formBounced = function(_html){
    if($('.popbox').length > 0){
        $('.popbox').remove();
        $('.popbox-wrap').remove();
    }
    window.scrollTo(0, 0); 
    $('body').append(_html);
};

// 节流
var throttle = function( fn, interval ){
    var _self = fn, // 保存需要被延迟执行的函数引用
        timer, // 定时器
        firstTime = true; // 是否是第一次调用
    return function(){
        var args = arguments,
            _me = this;

        if(firstTime){ // 如果是第一次调用，不需延迟执行
            _self.apply(_me, args);
            return firstTime = false;
        }
        if(timer){ // 如果定时器还在，说明前一次延迟执行还没有完成
            return false;
        }
        timer = setTimeout(function(){
            clearTimeout(timer);
            timer = null;
            _self.apply(_me, args);
        }, interval || 30);
    }
};

// 判断浏览器信息
var browser = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {     //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
};

// 滚动事件
var scrollFn = function (){
    var scrollTop = $(window).scrollTop();
    var $box = $('.back-top');
    //scrollTop > 300 ? $box.fadeIn(300) : $box.fadeOut(100);
    scrollTop > 300 ? $box.show() : $box.hide();
};

// 首页banner
$('.banner-owl').owlCarousel({
    items:1,
    loop:true,
    dots:true,
    lazyLoad:false,
    autoplay:true,
    autoplayTimeout:5000,
    autoplayHoverPause:true
});

// 首页新闻动态
(function($){
    var newsType = ['.news-dynamic-owl', '.news-industry-owl', '.news-media-owl'];
    var $newsTit = $('.news-box-tit');
    var $owl = $('.news-container').find('.owl-carousel');
    var $caseItems = $('.case-item');

    $caseItems.height(460/320 * $caseItems.width());

    $('.news-dynamic-owl').addClass('pass').owlCarousel({
        margin: 10,
        lazyLoad:false,
        dots:true,
        mouseDrag:false,
        navText:['',''],
        loop:true,
        nav:true,
        autoplay:true,
        autoplayTimeout:4000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items:1
            },
            800:{
                items:2
            },
            1024:{
                items:3
            }
        }
    });

    $newsTit.on('click', function() {
        var self = $(this);
        if(self.hasClass('cur')){
            return;
        }

        var $curTit = $('.news-box-nav').find('.cur');

        var oldIndex = $curTit.index();
        var $oldItem = $(newsType[oldIndex]);

        var curIndex = self.index();
        var $curItem = $(newsType[curIndex]);

        $newsTit.removeClass('cur');
        self.addClass('cur');
        $oldItem.hide();
        $curItem.fadeIn();
        if(!$curItem.hasClass('pass')){
            $curItem.addClass('pass').owlCarousel({
                margin: 10,
                lazyLoad:false,
                mouseDrag:false,
                dots:true,
                navText:['',''],
                loop:true,
                nav:true,
                autoplay:true,
                autoplayTimeout:4000,
                autoplayHoverPause:true,
                responsive:{
                    0:{
                        items:1
                    },
                    800:{
                        items:2
                    },
                    1024:{
                        items:3
                    }
                }
            });
        }
    });
})($);

// 首页领军人物
$('.leader-owl').owlCarousel({
    items:1,
    loop:true,
    dots:true,
    smartSpeed: 1000,
    margin: 10,
    lazyLoad:false,
    mouseDrag:false,
    autoplay:true,
    autoplayTimeout:5500,
    autoplayHoverPause:true
});

// 合作伙伴
$('.cooperation-owl').owlCarousel({
    loop:true,
    dots:false,
    nav:true,
    lazyLoad:false,
    navText:['',''],
    autoWidth:true,
    autoplay:true,
    autoplayTimeout:3000,
    autoplayHoverPause:true
});

// toggle 导航
$('.header-more').on('click', function(){
    $('.nav').stop().fadeToggle("slow");          
});

// 回到顶部
$('.back-top').on('click', function(){
    $('html,body').animate({scrollTop:0},300);       
});

// 提交留言
$('.submit-btn').on('click', function() {
    var _data = {
        user:   $.trim($('.input-name').val()),
        telphone:    $.trim($('.input-tel').val()), 
        email:    $.trim($('.input-email').val()), 
        message:    $.trim($('.input-message').val())
    };
    var _data = valiDation(['user','telphone','email','message'], $('.contactus-box'));
    if(_data === false){
        return;
    }
    $.ajax({
        url: '/user/message',
        type: 'POST',
        dataType: 'json',
        data: _data,
    })
    .done(function(data) {
        if(GetAttr(data,'meta.code') == 200 || GetAttr(data,'meta.code') == 201){
            setTipPop('留言成功', 1600, true);
            $('.contactus-input').val('');
            new JPlaceHolder();  
        }else{
            setTipPop(GetAttr(data,'meta.msg') || '系统处理异常！');
        }
    })
    .fail(function() {
        setTipPop('系统处理异常！');
    });
});

// input 事件 
$('body').on('focusin', '.popbox-input', function() {
    $(this).closest('.popbox-inputbox').addClass('popbox-inputbox-f');
}).on('focusout', '.popbox-input', function() {
    $(this).closest('.popbox-inputbox').removeClass('popbox-inputbox-f');
}).on('keyup', '.popbox-input', function() {
    valiDation($(this).attr('name'), $('.popbox-wrap'));
});
$('body').on('keyup', '.contactus-input', function() {
    valiDation($(this).attr('name'), $('.contactus-box'));
});
$('body').on('change', '.protocol-btn', function(){
    valiDation($(this).attr('name'), $('.popbox-wrap'));
});

// 登录弹框
$('body').on('click', '.lonin-btn', function() {
    var _html = '<div class="popbox"></div>';
    _html += '<div class="popbox-wrap">';
    _html +=     '<a class="popbox-close" href="javascript:void(0);">×</a>';
    _html +=     '<div class="popbox-header"></div>';
    _html +=         '<div class="popbox-con">';
    _html +=             '<div class="popbox-inputbox">';
    _html +=                 '<input class="popbox-input" autocomplete="off" type="email" placeholder="请输入邮箱" data-tip="请输入有效的邮箱地址！" data-reg="email" name="username"><i class="pop-icon icon-email"></i>';
    _html +=                 '<p class="popbox-input-tip"></p>';
    _html +=             '</div>';
    _html +=             '<div class="popbox-inputbox">';
    _html +=                 '<input class="popbox-input" autocomplete="off" type="password" placeholder="请输入6位以上的密码" data-tip="请输入有效的密码！" data-reg="password" name="password"><i class="pop-icon icon-password"></i>';
    _html +=                 '<p class="popbox-input-tip"></p>';
    _html +=             '</div>';
    // _html +=             '<div class="popbox-inputbox clearfix">';
    // _html +=                 '<input class="popbox-input popbox-input-no popbox-code pull-left" autocomplete="off" type="text" placeholder="验证码" data-tip="请输入有效的验证码！" data-reg="checkCode" name="checkCode"><img class="popbox-code-img pull-right" src="./img/code.png">';
    // _html +=                 '<p class="popbox-input-tip"></p>';
    // _html +=             '</div>';
    _html +=             '<div class="popbox-forgot clearfix">';
    //_html +=                 '<label class="pull-left"><input type="checkbox" name="flag">&nbsp;记住密码</label>';
    _html +=                 '<a class="popbox-forgot-btn pull-right" href="javascript:void(0);">忘记密码？</a>';
    _html +=             '</div>';
    _html +=             '<div class="popbox-inputbox">';
    _html +=                 '<a class="popbox-login-btn login-submit" href="javascript:void(0);">登&nbsp;录</a>';
    _html +=             '</div>';
    _html +=             '<div class="popbox-login-href"><a class="popbox-login-a register-btn" href="javascript:void(0);">没有账号？&nbsp;免费注册</a></div>';
    _html +=     '</div>';
    _html += '</div>';
    formBounced(_html);
    new JPlaceHolder($('.popbox-wrap'));   
});

// 注册弹框
$('body').on('click', '.register-btn', function() {
    var _html = '<div class="popbox"></div>';
    _html +=    '<div class="popbox-wrap">';
    _html +=        '<a class="popbox-close" href="javascript:void(0);">×</a>';
    _html +=        '<div class="popbox-header"></div>';
    _html +=        '<div class="popbox-con">';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<input class="popbox-input popbox-input-no" data-tip="请输入有效的公司名称！" data-reg="companyName" autocomplete="off" type="text" placeholder="公司名称" name="companyName">';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<input class="popbox-input popbox-input-no" data-tip="请输入有效的部门/职位！" data-reg="position" autocomplete="off" type="text" placeholder="部门/职位" name="position">';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<input class="popbox-input popbox-input-no" data-tip="请输入有效的联系方式！" data-reg="tel" autocomplete="off" type="text" placeholder="联系方式" name="tel">';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox clearfix">';
    _html +=                '<input class="popbox-input" data-tip="请输入有效的邮箱地址！" data-reg="email" autocomplete="off" type="email" placeholder="请输入邮箱地址" name="email"><i class="pop-icon icon-email"></i>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<input class="popbox-input" data-tip="密码不能少于6位！" data-reg="password" autocomplete="off" type="password" placeholder="请设置密码" name="password"><i class="pop-icon icon-password"></i>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<input class="popbox-input" data-tip="确认密码与密码不一致！" data-reg="cfmPassword" autocomplete="off" type="password" placeholder="请再次确认密码" name="cfmPassword"><i class="pop-icon icon-password"></i>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox popbox-forgot clearfix">';
    _html +=                '<label class="pull-left"><input class="protocol-btn" type="checkbox" checked data-tip="请阅读并勾选同意用户协议！" data-reg="consent" name="flag">&nbsp;我已阅读并同意</label><a class="agreement-btn" href="javascript:void(0);">《前海信息用户协议》</a>';
    //_html +=                '<a class="popbox-forgot-btn pull-right" href="javasrcipt:void(0);">忘记密码？</a>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<a class="popbox-login-btn register-sibmit" href="javascript:void(0);">注&nbsp;册</a>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-login-href"><a class="popbox-login-a lonin-btn" href="javascript:void(0);">已有账号？&nbsp;立即登录</a></div>';
    _html +=        '</div>';
    _html +=    '</div>';
    formBounced(_html);
    new JPlaceHolder($('.popbox-wrap'));  
});

// 忘记密码弹框
$('body').on('click', '.popbox-forgot-btn', function() {
    var _html = '<div class="popbox"></div>';
    _html +=    '<div class="popbox-wrap">';
    _html +=        '<a class="popbox-close" href="javascript:void(0);">×</a>';
    _html +=        '<div class="popbox-header"></div>';
    _html +=        '<div class="popbox-con reset-password-one">';
    _html +=            '<div class="reset-password"></div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<input class="popbox-input" data-tip="请输入有效的邮箱地址！" data-reg="email" autocomplete="off" type="email" placeholder="请输入邮箱" name="email"><i class="pop-icon icon-email"></i>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox clearfix">';
    _html +=                '<input class="popbox-input popbox-input-no popbox-code pull-left" data-tip="请输入有效的验证码！" data-reg="code" autocomplete="off" type="text" placeholder="验证码" name="code"><a class="popbox-getcode pull-right" href="javascript:void(0);">点击获取验证码</a>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<a class="popbox-login-btn email-code-submit" href="javascript:void(0);">下一步</a>';
    _html +=            '</div>';
    _html +=        '</div>';
    _html +=        '<div class="popbox-con reset-password-two">';
    _html +=            '<div class="reset-password"></div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<input class="popbox-input" data-tip="密码不能少于6位！" data-reg="password" autocomplete="off" type="password" placeholder="请设置新密码" name="password"><i class="pop-icon icon-password"></i>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox clearfix">';
    _html +=                '<input class="popbox-input" data-tip="确认密码与密码不一致！" data-reg="cfmPassword" autocomplete="off" type="password" placeholder="请再次确认新密码" name="cfmPassword"><i class="pop-icon icon-password"></i>';
    _html +=                '<p class="popbox-input-tip"></p>';
    _html +=            '</div>';
    _html +=            '<div class="popbox-inputbox">';
    _html +=                '<a class="popbox-login-btn forgot-password-submit" href="javascript:void(0);">确定</a>';
    _html +=            '</div>';
    _html +=        '</div>';
    _html +=    '</div>';
    formBounced(_html);
    new JPlaceHolder($('.popbox-wrap'));  
});

// 登录
$('body').on('click', '.login-submit', function() {
    var _data = valiDation(['username','password'], $('.popbox-wrap'));
    if(_data === false){
        return;
    }
    $.ajax({
        url: '/user/login',
        type: 'POST',
        dataType: 'json',
        data: _data,
    })
    .done(function(data) {
        if(GetAttr(data,'meta.code') == 200 || GetAttr(data,'meta.code') == 201){
            if(location.pathname == '/service/informations'){
                location.reload();
                return;
            }
            $('.popbox-close').trigger('click');
            setTipPop('登录成功', 1600, true);
            $('.footer-login').remove();
            $('.footer-info').append('<div class="footer-user"><i class="icon-user"></i>'+_data.username+'&nbsp;&nbsp;&nbsp;&nbsp;<a class="logout-btn" href="javascript:void(0);">登出</a></div>');
        }else{
            setTipPop(GetAttr(data,'meta.msg') || '系统处理异常！');
        }
    })
    .fail(function() {
        setTipPop('系统处理异常！');
    });
});

// 未登录下载
$('body').on('click', '.download-login-btn', function() {
    $('.lonin-btn').trigger('click');
});

// 登出
$('body').on('click', '.logout-btn', function() {
    $.ajax({
        url: '/user/logout',
        type: 'POST',
        dataType: 'json'
    })
    .done(function(data) {
        if(GetAttr(data,'meta.code') == 200 || GetAttr(data,'meta.code') == 201){
            setTipPop('登出成功', 1600, true);
            $('.footer-user').remove();
            $('.footer-info').append('<div class="footer-login"><a class="lonin-btn" href="javascript:void(0);">登录</a>&nbsp;/&nbsp;<a class="register-btn" href="javascript:void(0);">注册</a></div>');
        }else{
            setTipPop(GetAttr(data,'meta.msg') || '系统处理异常！');
        }
    })
    .fail(function() {
        setTipPop('系统处理异常！');
    });
});

// 注册 
$('body').on('click', '.register-sibmit', function() {
    var _data = valiDation(['companyName','position','email','tel','password','cfmPassword','flag'], $('.popbox-wrap'));
    if(_data === false){
        return;
    }
    $.ajax({
        url: '/user/register',
        type: 'POST',
        dataType: 'json',
        data: _data,
    })
    .done(function(data) {
        if(GetAttr(data,'meta.code') == 200 || GetAttr(data,'meta.code') == 201){
            $('.lonin-btn').trigger('click');
            setTipPop('注册成功', 1600, true);
        }else{
            setTipPop(GetAttr(data,'meta.msg') || '系统处理异常！');
        }
    })
    .fail(function() {
        setTipPop("系统处理异常！");
    });
});

// 获取验证码
$('body').on('click', '.popbox-getcode', function() {
    var self = $(this);
    if(self.hasClass('cur')){
        return;
    }
    var _data = valiDation(['email'], $('.popbox-wrap'));
    if(_data === false){
        return;
    }
    $.ajax({
        url: '/user/fetchcode',
        type: 'POST',
        dataType: 'json',
        data: _data
    })
    .done(function(data) {
        if(GetAttr(data,'meta.code') == 200 || GetAttr(data,'meta.code') == 201){
            countDown(self);
        }else{
            setTipPop(GetAttr(data,'meta.msg') || '系统处理异常！');
        }
    })
    .fail(function() {
        setTipPop("系统处理异常！");
    });
});

var emailName = '';
// 验证邮箱 
$('body').on('click', '.email-code-submit', function() {
    var _data = valiDation(['email','code'], $('.popbox-wrap'));
    if(_data === false){
        return;
    }
    emailName = _data.email;
    $.ajax({
        url: '/user/verify',
        type: 'POST',
        dataType: 'json',
        data: _data
    })
    .done(function(data) {
        if(GetAttr(data,'meta.code') == 200 || GetAttr(data,'meta.code') == 201){
            $('.reset-password-one').hide();
            $('.reset-password-two').show();
        }else{
            setTipPop(GetAttr(data,'meta.msg') || '系统处理异常！');
        }
    })
    .fail(function() {
        setTipPop("系统处理异常！");
    });
});

// 提交新密码 
$('body').on('click', '.forgot-password-submit', function() {
    var _data = valiDation(['password','cfmPassword'], $('.popbox-wrap'));
    if(_data === false){
        return;
    }
    $.ajax({
        url: '/user/modifypw',
        type: 'POST',
        dataType: 'json',
        data: _data,
    })
    .done(function(data) {
        if(GetAttr(data,'meta.code') == 200 || GetAttr(data,'meta.code') == 201){
            $('.popbox-close').trigger('click');
            setTipPop('密码修改成功', 1600, true);
            $('.footer-login').remove();
            $('.footer-info').append('<div class="footer-user"><i class="icon-user"></i>'+emailName+'&nbsp;&nbsp;&nbsp;&nbsp;<a class="logout-btn" href="javascript:void(0);">登出</a></div>');
        }else{
            setTipPop(GetAttr(data,'meta.msg') || '系统处理异常！');
        }
    })
    .fail(function() {
        setTipPop("error");
    });
});

// 弹出用户协议
$('body').on('click', '.agreement-btn', function() {
    $.ajax({
        url: '/static/protal/js/agreement.tpl',
        type: 'GET',
        dataType: 'html'
    })
    .done(function(data) {
        $('body').append(data || '');
    });
});

// 刷新验证码
$('body').on('click', '.popbox-code-img', function() {
    var self = $(this);
    self.attr('src', self.attr('src')+'?r='+Math.random());
});

// 关闭用户协议弹框
$('body').on('click', '.agreement-close, .agreement-close-btn', function() {
    window.scrollTo(0, 0);
    $('.agreement-wrap').remove();
});

// 关闭弹框
$('body').on('click', '.popbox-close', function() {
    $('.popbox-wrap').remove();
    $('.popbox').remove();
});

// 放大分析图
$('body').on('click', '.datamining-img-box', function() {
    var $this = $(this);
    var _src = $this.find('img').attr('src').replace('.jpg','-l.jpg');
    var _html = '<div class="popbox"></div><div class="popbox-wrap"><a class="popbox-close" href="javascript:void(0);">×</a><img src="'+_src+'"></div>';
    window.scrollTo(0, 0);
    $('body').append(_html);
});

$(window).on("resize", function() {
    setMinHeight();
});  

window.onscroll = throttle(scrollFn, 30);

$(document).ready(function() {
    setMinHeight();
    new JPlaceHolder();   
    $("img[data-src]").lazyload({
        data_attribute: 'src',
        threshold : 350,
        skip_invisible: false,
        effect : "fadeIn",
        //placeholder: 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg'
        placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    });

    if(!browser.versions.mobile){
        // 显示子菜单
        $('.nav-item-tail').on('mouseenter', function() {
            var $child = $(this).find('.nav-item-child');
            $child.stop().fadeIn();
        }).on('mouseleave', function() {
            var $child = $(this).find('.nav-item-child');
            $child.stop().fadeOut();
        });
        // 关注微信
        $('.icon-wx').on('mouseenter', function() {
            $('.footer-code').stop().fadeIn();
        }).on('mouseleave', function() {
            $('.footer-code').stop().fadeOut();
        });
        $(".flap").flap();
    }else{
        $('.nav-item-tail > .nav-item-a').attr('href','javascript:void(0);');
        $(".flap").addClass('flaped');
        $('.icon-wx').on('click', function() {
            $('.footer-code').stop().fadeToggle();
        });
        // 弹出菜单
        if(window.screen.availWidth >= 993 || $(document).width() >= 993){
            $('body').on('click.navClick', '.nav-item-tail', function() {
                var $navItems = $(this).closest('.nav-item-tail').siblings('.nav-item-tail');
                var $child = $(this).find('.nav-item-child');
                $navItems.find('.nav-item-child').fadeOut();
                $child.stop().fadeToggle();
            });
        }else{
            $('body').on('click.navClick', '.nav-item-tail', function() {
                var $child = $(this).find('.nav-item-child');
                $child.stop().fadeToggle();
            });
        }

        $(window).on('resize', function() {
            if(window.screen.availWidth >= 993 || $(document).width() >= 993){
                $('body').off('click.navClick').on('click.navClick', '.nav-item-tail', function() {
                    var $navItems = $(this).closest('.nav-item-tail').siblings('.nav-item-tail');
                    var $child = $(this).find('.nav-item-child');
                    $navItems.find('.nav-item-child').fadeOut();
                    $child.stop().fadeToggle();
                });
            }else{
                $('body').off('click.navClick').on('click.navClick', '.nav-item-tail', function() {
                    var $child = $(this).find('.nav-item-child');
                    $child.stop().fadeToggle();
                });
            }
        });
        
        $.getScript("/static/protal/js/fastclick.min.js", function(){
            FastClick.attach(document.body);
        });
    }     
});  
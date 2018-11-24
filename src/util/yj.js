/*
* @Author: 93935
* @Date:   2018-10-25 11:21:29
* @Last Modified by:   93935
* @Last Modified time: 2018-11-15 16:22:08
*/
'use strict';
var conf = {
    serverHost : ''
};
var _mm = {
    // 获取服务器地址
    getServerUrl : function(path){
        return conf.serverHost + path;
    },
    // 获取url参数
    getUrlParam : function(name){
        var reg     = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
        var result  = window.location.search.substr(1).match(reg);
        return result ? decodeURIComponent(result[2]) : null;
    },
    // 渲染html模板
    // renderHtml : function(htmlTemplate, data){
    //     var template    = Hogan.compile(htmlTemplate),
    //         result      = template.render(data);
    //     return result;
    // },
    // 统一登录处理
    doLogin : function(){
        window.location.href = './login.html?redirect=' + encodeURIComponent(window.location.href);
    },
    goHome : function(){
        window.location.href = './index.html';
    }
};

module.exports = _mm;
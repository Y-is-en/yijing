/*
* @Author: 93935
* @Date:   2018-10-18 16:08:06
* @Last Modified by:   93935
* @Last Modified time: 2018-10-28 20:36:55
*/
'use strict';

require('./index.css');
layui.use(['laytpl','carousel','layer', 'form', 'element', 'jquery'], function(){
    var layer = layui.layer; //弹层
//搜索
       $('.search').on('click', function(){
        layer.open({
          type: 1
          ,title: false
          ,closeBtn: false
          ,shade: [0.5, '#333']
          ,shadeClose: true
          ,maxWidth: 10000
          ,skin: 'fly-layer-search'
          ,content: ['<form action="http://cn.bing.com/search">'
            ,'<input autocomplete="off" placeholder="搜索内容，回车跳转" type="text" name="q">'
          ,'</form>'].join('')
          ,success: function(layero){
            var input = layero.find('input');
            input.focus();

            layero.find('form').submit(function(){
              var val = input.val();
              if(val.replace(/\s/g, '') === ''){
                return false;
              }
              input.val('site:layui.com '+ input.val());
          });
          }
        })
      });

  });
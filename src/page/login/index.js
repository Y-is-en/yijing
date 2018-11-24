'use strict';
require('./index.css');
require('../common/header/index.js');
layui.use(['layer', 'form', 'element', 'jquery'], function(){
    var layer = layui.layer //弹层
      ,element = layui.element //元素操作
      ,$ = layui.jquery,
      form=layui.form;

            form.on('submit(*)', function(data){
                var reqData=data.field;
                $.post('/user/login.do',reqData,function(resp){
                    
                    if (resp.status===0) {
                        $(location).attr('href', './index.html');
                        layer.close(index); 
                    }
                    layer.msg(resp.msg);
                });
                return false;
            });
            
          
});
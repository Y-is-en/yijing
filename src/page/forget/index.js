/*
* @Author: 93935
* @Date:   2018-10-24 10:06:47
* @Last Modified by:   93935
* @Last Modified time: 2018-10-24 21:26:27
*/
'use strict';
require('./index.css');
require('../common/header/index.js');
layui.use(['layer', 'form', 'element', 'jquery'], function(){
    var layer = layui.layer //弹层
      ,element = layui.element //元素操作
      ,$ = layui.jquery,
      form=layui.form;
      var type='phone'
        form.on('submit(*)', function(data){
            var reqData=data.field;

            $.post('http://www.rcswu.cn/user/login.do',reqData,function(resp){
                layer.msg(resp.msg);
                if (resp.status===0) {
                    $(location).attr('href', './index.html');
                    layer.close(index); 
                }
            });
            return false;
        });
    
    element.on('tab(user)', function(data){
      if (data.index===1) {
        $('label[for="R_valid"]').html('<i class="layui-icon layui-icon-vercode"></i>邮箱验证码');
        type='email';
      }else{
        $('label[for="R_valid"]').html('<i class="layui-icon layui-icon-vercode"></i>手机验证码');
        type='phone';
      }
    }); 

    // 发送验证码
    $('#valid-btn').on('click',function(){
        var timenum=31,
        sno='',
        phone='';
        var $this=$(this);
        $this.text("发送中");
        sno=$('input[name="sno"]').val();
        console.log(sno);
        if(sno===''){
            layer.msg('请先输入学号');
            $this.text("发送验证码");
            return;
        }
        $.post('http://www.rcswu.cn/user/forget_validcode.do',{
            sno:sno,
            type:type
        } ,function(resp){
            if (resp.status===0) {
                $this.addClass('layui-btn-disabled');
                var int=self.setInterval(function(){
                    timenum--;
                    console.log(timenum);
                    if (timenum>0) {
                      $this.text("已发送("+timenum+"秒)");  
                    }else{
                        window.clearInterval(int);
                        $this.text("发送验证码");
                       $this.removeClass('layui-btn-disabled'); 
                    }
                },1000);
                return;
            };
            layer.msg(resp.msg);
            $this.text("发送验证码");
        });
    }); 

    form.on('submit(*)', function(data){
                var reqData=data.field;
                if (reqData.password!==reqData.password2) {
                    layer.msg('两次输入的密码不一致，请重新输入');
                    return false;
                }
                reqData.type=type;
                $.post('http://www.rcswu.cn/user/forgetPassword.do',reqData,function(resp){
                    
                    if (resp.status===0) {
                        layer.open({
                          content: '密码已修改!',
                          btn:['去登录'],
                          yes: function(index, layero){
                            $(location).attr('href', './login.html');
                            layer.close(index); 
                          }
                        });
                        return; 
                    }
                    layer.msg(resp.msg);
                });
                return false;
            });
          
});
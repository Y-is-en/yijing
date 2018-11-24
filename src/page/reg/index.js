'use strict';
require('./index.css');
require('../common/header/index.js');

layui.use(['layer', 'form', 'element', 'jquery'], function(){
    var layer = layui.layer //弹层
      ,element = layui.element //元素操作
      ,$ = layui.jquery,
      form=layui.form;
      var gsc_data={};//班级信息
      initData();
      // 表单验证
      form.verify({
          usersno: function(value, item){ //value：表单的值、item：表单的DOM对象
            // if(!new RegExp("/\d{2}/").test(value)){
            //   return '学号格式不正确';
            // };
          },
          biaodian:function(value, item){ //value：表单的值、item：表单的DOM对象
            if(!new RegExp("/\W/g").test(value)){
              return '姓名不能包含标点符号';
            };
          }
       });
      // 根据选择改变选择框内容
      form.on('select(science)', function(science_choosed){
        if (science_choosed.value!=='') {
            var grades=[];
            $('select[name="grade"]').html('<option value="" selected="">请选择年级</option>');
            for (var i = gsc_data.data.length - 1; i >= 0; i--) {
               var grade=gsc_data.data[i].grade;
               var science=gsc_data.data[i].science;
                if ($.inArray(grade,grades)===-1&&science_choosed.value==science) {
                    grades.push(grade);
                    $('select[name="grade"]').append('<option value="'+grade+'">'+grade+'级</option>');
                }
            }
            form.render();
            form.on('select(grade)', function(grade_choosed){
                var nums=[];
                $('select[name="class"]').html('<option value="" selected="">请选择班级</option>');
                for (var i = gsc_data.data.length - 1; i >= 0; i--) {
                   var grade=gsc_data.data[i].grade;
                   var science=gsc_data.data[i].science;
                   var num=gsc_data.data[i].num;
                    if ($.inArray(num,nums)===-1&&science_choosed.value==science&&grade_choosed.value==grade) {
                        nums.push(num);
                        $('select[name="class"]').append('<option value="'+num+'">'+num+'班</option>');
                    }
                }
                form.render();
            });
            
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
        phone=$('input[name="phone"]').val();
        console.log($('input[name="phone"]'));
        if (phone==='') {
            layer.msg('手机号不能为空');
            $this.text("发送验证码");
            return;
        }
        $.post('http://www.rcswu.cn/user/get_validCode.do',{
            sno:sno,
            phone:phone
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
          reqData.classes= reqData.grade+'级'+reqData.science+'专业'+reqData.class+'班';
          $.post('http://www.rcswu.cn/user/register.do',reqData,function(resp){
            if (resp.status===0) {
                layer.open({
                  content: '注册成功!',
                  btn:['去登录'],
                  yes: function(index, layero){
                    $(location).attr('href', './login.html');
                    layer.close(index); 
                  }
                });
                return;
            };
            layer.msg(resp.msg);
          })
          return false; 
        });

    function initData(){
        // 专业年级初始化
        $.post('http://www.rcswu.cn/yijing/manage/class/get_classes.do',function(data){
            gsc_data=data;
            var grades=[];
            var sciences=[];
            for (var i = data.data.length - 1; i >= 0; i--) {
               var grade=data.data[i].grade;
               var science=data.data[i].science;
               var num=data.data[i].num;
                if ($.inArray(grade,grades)===-1) {
                    grades.push(grade);
                    $('select[name="grade"]').append('<option value="'+grade+'">'+grade+'级</option>');
                }
                if ($.inArray(science,sciences)===-1) {
                    sciences.push(science);
                    $('select[name="science"]').append('<option value="'+science+'">'+science+'专业</option>');
                }
            }
            $('select[name="class"]').html('<option value="" selected="">请选择班级</option>');
            form.render();
        });
    }
});
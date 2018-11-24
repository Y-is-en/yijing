/*
* @Author: 93935
* @Date:   2018-11-14 21:34:02
* @Last Modified by:   93935
* @Last Modified time: 2018-11-23 23:44:09
*/
'use strict';
require('./index.css');
require('../common/header/index.js');

var yj=require('../../util/yj.js');
layui.use(['layer', 'laytpl', 'form', 'element', 'jquery','fly','flow'], function(){
    var layer = layui.layer //弹层
        ,element = layui.element //元素操作
        ,$ = layui.jquery,
        form=layui.form,
        laytpl = layui.laytpl,
        fly=layui.fly,
        flow = layui.flow;

    var user='';
    $.post('/user/get_info.do',function(resp){
        if (resp.status===0) {
            var data = resp.data;
            user=data.sno;
        }
    });

      var card=yj.getUrlParam('cardid');
      $.post('/card/detail.do?cardId='+card,function(resp){  
            if (resp.status===0) {
                console.log(resp);
                var data=resp.data;
                if (data.user) {
                  data.user=data.user.split(';');
                }
                if (data.tag) {
                  data.tag=data.tag.split('##');
                }
                data.image=data.image.split(';')[0];
                data.content=fly.content(data.content);
                data.updateTime=fly.formattime(data.updateTime);
                if (data.ispraise) {
                    data.ispraised='praised';
                }
                var getTpl = $('#cardinfo').html()
                ,view = document.getElementById('card');
                laytpl(getTpl).render(data, function(html){
                  view.innerHTML = html;
                });
            }else{
                layer.msg(resp.msg);
            }
            
        });

      $('.faces').on('click',function(){
        var str = '', ul, face = fly.faces,self=$(this);
          for(var key in face){
            str += '<li title="'+ key +'"><img src="'+ face[key] +'"></li>';
          }
          str = '<ul id="LAY-editface" class="layui-clear">'+ str +'</ul>';
          layer.tips(str, self, {
            tips: 3
            ,time: 0
            ,shade:0.001
            ,shadeClose:true
            ,skin: 'layui-edit-face'
          });
          $('#LAY-editface li').on('click', function(){
            var title = $(this).attr('title') + ' ';
            var comtent=$('.layui-textarea').val();
            $('.layui-textarea').val(comtent+'face' + title);
            layer.close(layer.index);
          });
      });

      form.on('submit(addComment)', function(data){
        if (user=='') {
          $(location).attr('href', './login.html');
          return false;
        }
        var reqData=data.field;
        reqData.cardId=card;
        reqData.type=reqData.hide;
        $.post('/comment/add_comment.do',reqData,function(resp){  
            if (resp.status===0) {
                layer.msg('评论已提交', {
                  icon: 1
                  ,time: 800
                  ,shade: 0.1
                }, function(){
                  $('.layui-textarea').val('');
                }); 
                return false;
            }
            layer.msg(resp.msg);
        });
        return false;
      });

      

      flow.load({
        elem: '#comment-container' //指定列表容器
        ,end: '到头了'
        ,done: function(page, next){
            $.post('/comment/get_list.do?cardId='+card,function(resp){ 
                console.log(resp);
                if (resp.status===0) {

                }else{
                    layer.msg(resp.msg);
                }
            });
        }

    });
  });
'use strict';
require('./index.css');
require('../common/header/index.js');

var yj=require('../../util/yj.js');
layui.use(['layer', 'laytpl', 'form', 'element','carousel', 'jquery','fly','flow'], function(){
    var layer = layui.layer //弹层
      ,element = layui.element //元素操作
      ,$ = layui.jquery,
      form=layui.form,
      laytpl = layui.laytpl,
      layedit = layui.layedit,
      fly=layui.fly,
      flow = layui.flow;

      var write_taps=[],images='default;',user='';
// 轮播图
  var carousel = layui.carousel;
  //建造实例
  carousel.render({
    elem: '#banner'
    ,width: '100%' //设置容器宽度
    ,arrow: 'always' //始终显示箭头
    //,anim: 'updown' //切换动画方式
  });
// 标签卡片和功能卡片固定
    var isfixed=false;
    $(document).scroll(function(){
        var tap = $(".tap-panel");
        var topic=$(".topic");
        var boxTop = tap.offset().top-50;
        var winScrollTop = $(window).scrollTop();  //获取窗口滚动的距离
        if(winScrollTop > boxTop&&!isfixed){
            tap.addClass("tap-fixed");
            topic.addClass("topic-fixed");
            $('span.write-btn').show();
            isfixed=true;
        }else if (winScrollTop <= 306&&isfixed){
            tap.removeClass("tap-fixed");
            topic.removeClass("topic-fixed");
            isfixed=false;
            $('span.write-btn').hide();
        }

    });
    // 链接标签提取
    var taps=yj.getUrlParam('tag'),tap_html=[];
    if (taps) {
      layui.each(taps.split(','),function(index,item){
        tap_html.push('<span class="taps choosed-tap">#'+item+'</span> ');
      });
      $('.choosed-taps').html('标签： '+tap_html.join(''));
    }
    
    
      //用户信息卡片渲染 
    $.post('/user/get_info.do',function(resp){
      if (resp.status===0) {
        var data = resp.data;
        user=data.sno;
        if (data.relation) {
          data.relation=data.relation.split(',')[0];
        }
        var getTpl = $('#userinfo').html()
        ,view = document.getElementById('user-info');
        laytpl(getTpl).render(data, function(html){
          view.innerHTML = html;
        });
        var date = new Date();
        var newTime = fly.formatdate(date.getTime());
        var signin=data.signin.split(';');
        if (signin[0]==newTime) {
          $('.signin').text('已连续签到'+signin[3]+'天')
          .addClass('layui-btn-disabled');
        }else{
          // 签到
         $('.signin').on('click',function(){
          if (user=='') {
            yj.doLogin();
            return false;
          }
          var $this=$(this);
          if ($this.hasClass('layui-btn-disabled')) {
            return false;
          }
            $.post('/user/signin.do',function(res){
                if(res.status===0){
                  var data=res.data.split(';');
                  $this.text('已连续签到'+data[3]+'天');
                  $this.addClass('layui-btn-disabled');
                }else{
                  layer.msg(res.msg);
                }
            });
         });
        }
      }
      //写卡片窗口
       $('.write-btn').on('click',function(){
          layer.open({
            type:1,
            title:'写卡片',
            area:['900px','665px'],
            anim: 2,
            content:$('#addbox')
           });
       });
       
    });
   
    //卡片初次渲染 
    function uploadCard(page){
      $.post('/card/get_list.do',function(resp){
        if (resp.status===0) {
          var data = resp.data;
          layui.each(data.list, function(index, item){
            data.list[index].updateTime=fly.formattime(item.updateTime);
            if (item.user) {
              data.list[index].user=item.user.split(';');
            }
            data.list[index].content=fly.escape(item.content||'') //XSS
                  .replace(/img\[([^\s]+?)\]/g, '[图片]');
            if (item.tag) {
              data.list[index].tag=item.tag.split('##');
            }
            data.list[index].image=item.image.split(';');
          });
          var getTpl = $('#cardinfo').html()
          ,view = document.getElementById('card-info');
          laytpl(getTpl).render(data, function(html){
            view.innerHTML = html;
          });
          // 点赞功能
          $('.add-praise').on('click',function(){
            var cardId=$(this).data('cardid'),
            $this=$(this);
            var praise_num=$this.children('.praise-val').data('num');
            console.log(praise_num);
            if (user=='') {
                yj.doLogin();
                return false;
              }
              if ($this.hasClass('praised')) {
                $.post('/card/praise_cancel.do?cardId='+cardId,function(res){
                  if(res.status===0){
                    $this.removeClass('praised');
                    $this.children('.praise-val').data('num',--praise_num);
                    $this.children('.praise-val').text(praise_num==0?'点赞':praise_num);
                  }else{
                    layer.msg(resp.msg);
                  }
                });
              }else{
                $.post('/card/praise_card.do?cardId='+cardId,function(res){
                  if(res.status===0){
                    $this.addClass('praised');
                    $this.children('.praise-val').data('num',++praise_num);
                    $this.children('.praise-val').text(praise_num);
                  }else{
                    layer.msg(resp.msg);
                  }
                });
              } 
          });

          // 加好友
          var $addfriend=$('.add-friend'),friend;
          layui.each($addfriend,function(index, item){
            friend=$(item).data('friend');
            if (friend==user) {
              $($addfriend[index]).hide(); //若是自己则隐藏
            }
          });
          $('.add-friend').on('click',function(){
            friend=$(this).data('friend');
            $.post('/user/request_friend.do?sno='+friend,function(res){
              layer.msg(res.msg);
            });
          });

          //标签点击
          $('.card-tap a').on('click',function(){
            var tag=$(this).text().replace('#','');
            $(location).attr('href', './index.html?tag='+tag);
          });

          // 图片点击
          layer.photos({
                photos: '.card-image'
                ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机（请注意，3.0之前的版本用shift参数）
              });
          // 分享功能
          socialShare('.social-share', {sites: ['qzone', 'qq', 'weibo','wechat']});
          $('.share').on('click',function(){
            var $share=$(this).parent().children('.share-content');
            if ($share.hasClass('hide')) {
              $share.removeClass('hide');
            }else{
              $share.addClass('hide');
            }
          });
        }else{
          layer.msg(resp.msg);
        }
      });
    };

    // 流加载
    flow.load({
    elem: '#card-container' //指定列表容器
    ,end: '刷~刷~刷，咦，木有卡片了|-_-|'
    ,done: function(page, next){ 
      if (!taps) {
        taps='';
      }
      $.post('/card/get_list.do?pageNum='+page+'&tag='+taps,function(resp){
        if (resp.status===0) {
          var data = resp.data;
          layui.each(data.list, function(index, item){
            data.list[index].updateTime=fly.formattime(item.updateTime);
            if (item.user) {
              data.list[index].user=item.user.split(';');
            }
            data.list[index].content=fly.escape(item.content||'') //XSS
                  .replace(/img\[([^\s]+?)\]/g, '[图片]');
            if (item.tag) {
              data.list[index].tag=item.tag.split('##');
            }
            data.list[index].image=item.image.split(';');
            var bg=data.list[index].image[0];
            if (bg!='card-color-red'&&bg!='card-color-pink'&&bg!='card-color-green'
              &&bg!='card-color-yellow'&&bg!='card-color-blue'&&bg!='card-color-cyan') {
              data.list[index].image[0]='default';
            }
          });
          var getTpl = $('#cardinfo').html()
          ,view = document.getElementById('card-info');
          laytpl(getTpl).render(data, function(html){
            next(html, resp.data.hasNextPage);
          });
          // 点赞功能
          $('.add-praise').on('click',function(){
            var cardId=$(this).data('cardid'),
            $this=$(this);
            var praise_num=$this.children('.praise-val').data('num');
            console.log(praise_num);
            if (user=='') {
                $(location).attr('href', './login.html');
                return false;
              }
              if ($this.hasClass('praised')) {
                $.post('/card/praise_cancel.do?cardId='+cardId,function(res){
                  if(res.status===0){
                    $this.removeClass('praised');
                    $this.children('.praise-val').data('num',--praise_num);
                    $this.children('.praise-val').text(praise_num==0?'点赞':praise_num);
                  }else{
                    layer.msg(resp.msg);
                  }
                });
              }else{
                $.post('/card/praise_card.do?cardId='+cardId,function(res){
                  if(res.status===0){
                    $this.addClass('praised');
                    $this.children('.praise-val').data('num',++praise_num);
                    $this.children('.praise-val').text(praise_num);
                  }else{
                    layer.msg(res.msg);
                  }
                });
              } 
          });

          // 加好友
          var $addfriend=$('.add-friend'),friend;
          layui.each($addfriend,function(index, item){
            friend=$(item).data('friend');
            if (friend==user) {
              $($addfriend[index]).hide(); //若是自己则隐藏
            }
          });
          $('.add-friend').on('click',function(){
            friend=$(this).data('friend');
            $.post('/user/request_friend.do?sno='+friend,function(res){
              layer.msg(res.msg);
            });
          });

          //标签点击
          $('.card-tap a').on('click',function(){
            var tag=$(this).text().replace('#','');
            $(location).attr('href', './index.html?tag='+tag);
          });

          // 图片点击
          layer.photos({
                photos: '.card-image'
                ,anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机（请注意，3.0之前的版本用shift参数）
              });
          // 分享功能
          socialShare('.social-share', {sites: ['qzone', 'qq', 'weibo','wechat']});
          
        }else{
          layer.msg(resp.msg);
        }
      });
    }
  });
   $(document).on("click",".share",function(){
            var $share=$(this).parent().children('.share-content');
            if ($share.hasClass('hide')) {
              $share.removeClass('hide');
            }else{
              $share.addClass('hide');
            }
          });

   // 标签选择
   $('.tap').on('click',function(){
    var tapname=$(this).text();
    
      if($(this).hasClass('choosed-tap')){
        $(this).removeClass('choosed-tap');
        write_taps.splice($.inArray(tapname,write_taps),1);
      }else{
        if($.inArray(tapname,write_taps)!==-1){
          layer.msg('该标签已经有');
          return;
        }
        $(this).addClass('choosed-tap');
        write_taps.push(tapname);
      }
      
   });

   //添加自定义标签
   $('#addtap').on('click',function(){
    var tapval=$('.self-tap').val();
    if(tapval===''){
      layer.msg('标签不能为空');
      return;
    }
    if($.inArray(tapval,write_taps)!==-1){
      layer.msg('该标签已经有');
      return;
    }
    $('.self-box').before('<span class="self tap choosed-tap">'+tapval+'</span>');
    write_taps.push(tapval);
    $('.self.tap').on('click',function(){
          $(this).remove();
          write_taps.splice($.inArray(tapval,write_taps),1);
     });
    $('.self-tap').val('');

   });
   
   // 选择卡片颜色
   $('.color').on('click',function(){
      $('.choosed-color').removeClass('choosed-color');
      $(this).addClass('choosed-color');
      var color=$(this).attr('class').split(' ');
      $('#addbox').attr('class','layui-form');
      $('#addbox').addClass(color[0]);
      images=color[0]+';'+images.split(';')[1];
   });
   
   form.on('submit(addcard)', function(data){
        if (user=='') {
          $(location).attr('href', './login.html');
          return false;
        }
        var reqData=data.field;
        reqData.image=images;
        reqData.tag=write_taps.join('##');
        $.post('/card/write_card.do',reqData,function(resp){  
            if (resp.status===0) {
                layer.msg('卡片提交成功', {
                  icon: 1
                  ,time: 800
                  ,shade: 0.1
                }, function(){
                  location.reload();
                }); 
                return false;
            }
            layer.msg(resp.msg);
        });
        return false;
    });

// 更多标签点击
   $('.tap-btn').on('click',function(){
      if ($('.hot-tap').hasClass('hide')){
        $('.more-tap').addClass('hide');
        $('.hot-tap').removeClass('hide');
      }else{
        $('.hot-tap').addClass('hide');
        $('.more-tap').removeClass('hide');
      }
    });

   $('.hot-tap .taps,.more-tap .taps').on('click',function(){
    var tap=$(this).text();
    tap=tap.replace('#','');
    if (taps==''||!taps) {
      taps=tap;
    }else{
      taps+=','+tap;
    }
    $(location).attr('href', './index.html?tag='+taps);
   });
   
   
});
  






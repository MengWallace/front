var AppOpen=function(){function t(){$.ajax({type:"GET",cache:!1,url:"apis/v1/apps",dataType:"json",headers:{Accept:"application/json"},success:function(t){x.apps=t,o()},error:function(t,e,a){var o=$("#apps-table-error").html();$("#apps-table").html(Mustache.render(o,{error:""}))}})}function e(t,e){var a=$(t).closest(".btn-group").find(".more-scopes");$.ajax({type:"GET",cache:!1,url:"apis/v1/apps/"+e+"/more_scopes",dataType:"json",headers:{Accept:"application/json"},success:function(t){a.html("<a href=\"javascript:AppOpen.cancelAppScope('"+e+"')\">取消高级授权申请</a>")},error:function(t,o,n){a.html("<a href=\"javascript:AppOpen.regAppScope('"+e+"')\">申请高级权限</a>")}})}function a(t){$.ajax({type:"GET",cache:!1,url:"apis/v1/apps/"+t+"/users_count",headers:{Accept:"application/json"},success:function(e){return 0==e.count?void swal({title:"现在没有用户授权该应用，无需撤销",text:"你可以点击 【应用详情】里的 “获取 authorization code 的链接” 的示例链接体验授权过程。",type:"success",confirmButtonText:"确定"}):void swal({title:"现在共有 "+e.count+" 个用户授权该应用， 确定撤销授权吗？",text:"撤销授权后，用户进入应用时将需要重新弹出授权界面，且获取到的用户token将立即失效。",type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:"确定",cancelButtonText:"取消",closeOnConfirm:!1},function(){$.ajax({type:"GET",cache:!1,url:"apis/v1/apps/"+t+"/users_revoke",headers:{Accept:"application/json"},success:function(t){swal({title:"已经成功撤销所有用户授权",type:"success",confirmButtonText:"确定"})},error:function(t,e,a){swal({title:"撤销所有用户授权失败,请稍后重试!",type:"error",confirmButtonText:"确定"})}})})},error:function(t,e,a){swal({title:"数据读取错误,请稍后重试!",type:"error",confirmButtonText:"确定"})}})}function o(){var t=$("#apps-table-template").html();$("#apps-table-subtitle").html("您最多还可以创建 "+(10-x.apps.length)+" 个应用");for(var e=0;e<x.apps.length;e++)x.apps[e].createdatLocal=moment(new Date(x.apps[e].createdat)).fromNow(),x.apps[e].statusLocal=x.statusLocal[x.apps[e].status];$("#apps-table").html(Mustache.render(t,x)),App.toggleTooltip()}function n(t){for(var e=0;e<x.apps.length;e++)if(x.apps[e].id==t){var a=window.location.origin+"/oauth2/authorize";return x.apps[e].authorization_code_url=a+"?response_type=code&scope=userinfo&state=yourstate&client_id="+t+"&redirect_uri="+x.apps[e].redirecturi+"/callback/oauth",$("#modal-app-detail").html(Mustache.render($("#modal-app-detail-template").html(),x.apps[e])),void $("#modal-app-detail").modal("show")}}function p(t){for(var e=0;e<x.apps.length;e++)if(x.apps[e].id==t){var a={name:x.apps[e].name,scopes:x.advancedScopes};if(void 0!=x.apps[e].allowedscopes)for(var o=x.apps[e].allowedscopes.split(" ",-1),e=0;e<o.length;e++)for(var n=0;n<a.scopes.length;n++)a.scopes[n].id==o[e]&&(a.scopes[n].acquired=!0);var p=!0;return a.scopes.forEach(function(t){if(1!=t.acquired)return void(p=!1)}),a.nosubmit=p,$("#modal-reg-scope").html(Mustache.render($("#modal-reg-scope-template").html(),a)),$("#modal-reg-scope").modal("show"),void s(t)}}function r(t){for(var e=0;e<x.apps.length;e++)if(x.apps[e].id==t)return void swal({title:"确定取消申请吗？",text:"取消申请后如需更多权限，您将需要重新申请。",type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:"确定",cancelButtonText:"取消",closeOnConfirm:!1},function(){$.ajax({type:"DELETE",cache:!1,url:"apis/v1/apps/"+t+"/more_scopes",headers:{Accept:"application/json"},success:function(t){swal({title:"取消成功",type:"success",confirmButtonText:"确定"})},error:function(t,e,a){swal({title:"取消失败!",type:"error",confirmButtonText:"确定"})}})})}function s(t){$("#modal-reg-scope").find("form").validator().submit(function(e){if(!e.isDefaultPrevented()){var a=$(e.target),o=$(".alert",a);o.addClass("hide"),e.preventDefault();for(var n=a.serializeArray(),p=!1,r="scopes=",s=0;s<n.length;s++)"on"==n[s].value&&(r+=n[s].name+"%20",p=!0);if(!p)return $("text",o).text("请选择要申请的高级权限。"),void o.removeClass("hide");r=r.substr(0,r.length-3),$.ajax({type:"POST",url:"apis/v1/apps/"+t+"/more_scopes",headers:{Accept:"application/json"},data:r,success:function(t){a.trigger("reset"),a.closest(".modal").modal("hide"),swal({title:"已成功提交审核",text:"请耐心等待审核结果!",type:"success",confirmButtonText:"确定"})},error:function(t,e,a){400==t.status?$("text",o).text("输入信息处理错误,请重试。"):$("text",o).text("信息处理错误,请稍后重试。"),o.removeClass("hide")}})}})}function i(t){for(var e=0;e<x.apps.length;e++)if(x.apps[e].id==t)return $("#modal-edit-app").find(".modal-body").html(Mustache.render($("#modal-edit-app-template").html(),x.apps[e])),$("#modal-edit-app").modal("show"),void m(t)}function c(t){for(var e=0;e<x.apps.length;e++)if(x.apps[e].id==t)return $("#modal-app-publish").html(Mustache.render($("#modal-app-publish-template").html(),x.apps[e])),void $("#modal-app-publish").modal("show")}function l(e){for(var a=0;a<x.apps.length;a++)if(x.apps[a].id==e)return void swal({title:"确定撤销发布吗?",text:"撤销发布后，用户将无法在应用中心搜索到您的应用，安装应用的用户也将无法进入应用!",type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:"确定",cancelButtonText:"取消",closeOnConfirm:!1},function(){$.ajax({type:"GET",url:"/open/apps/"+e+"/reset_secret",headers:{Accept:"application/json"},success:function(e){t(),swal({title:"撤销发布成功",type:"success",confirmButtonText:"确定"})},error:function(t,e,a){swal({title:"系统错误，请稍后重试",type:"error",confirmButtonText:"确定"})}})})}function u(t){swal({title:"确定重置Client Secret吗?",text:"重置后原Client Secret 将失效，您可以能需要调整对应程序才能让该应用正常工作!",type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:"重置",cancelButtonText:"取消",closeOnConfirm:!1},function(){swal({title:"",showConfirmButton:!1,timer:0}),$.ajax({type:"GET",url:"apis/v1/apps/"+t+"/reset_secret",headers:{Accept:"application/json"},success:function(e){for(var a=0;a<x.apps.length;a++)x.apps[a].id!=t||(x.apps[a]=e);n(t)},error:function(t,e,a){swal({title:"系统错误，请稍后重试",type:"error",confirmButtonText:"确定"})}})})}function d(t){swal({title:"确定删除吗?",text:"删除应用后，Client ID 和 Client Secret 将失效，相关功能也会被删除!",type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:"删除",cancelButtonText:"取消",closeOnConfirm:!1},function(){$.ajax({type:"DELETE",url:"apis/v1/apps/"+t,headers:{Accept:"application/json"},success:function(e){for(var a=0;a<x.apps.length;a++)x.apps[a].id!=t||(x.apps.splice(a,1),$("#apps-table").find("tr:eq("+a+")").remove());swal({title:"删除成功",type:"success",confirmButtonText:"确定"})},error:function(t,e,a){swal({title:"系统错误，请稍后重试",type:"error",confirmButtonText:"确定"})}})})}function f(){return void 0!=x.apps&&x.apps.length>=10?void swal({title:"您最多只能创建10个应用，请删除部分应用后重试",type:"warning",confirmButtonText:"确定"}):($("#modal-create-app").find(".modal-body").html(Mustache.render($("#modal-edit-app-template").html(),{})),$("#modal-create-app").modal("show"),void h())}function m(t){$("#modal-edit-app").find("form").validator().submit(function(e){if(!e.isDefaultPrevented()){var a=$(e.target),n=$(".alert",a);n.addClass("hide"),e.preventDefault();var p=JSON.stringify(a.serializeObject());$.ajax({type:"PUT",url:"apis/v1/apps/"+t,headers:{Accept:"application/json","Content-Type":"application/json; charset=utf-8"},data:p,success:function(t){a.trigger("reset");for(var e=0;e<x.apps.length;e++)x.apps[e].id==t.id&&(x.apps[e]=t);a.closest(".modal").modal("hide"),o()},error:function(t,e,a){400==t.status?$("text",n).text("您输入的名称已被使用，请更换一个名称"):$("text",n).text("输入信息处理错误,请稍后重试。"),n.removeClass("hide")}})}})}function h(){$("#modal-create-app").find("form").validator().submit(function(t){if(!t.isDefaultPrevented()){var e=$(t.target),a=$(".alert",e);a.addClass("hide"),t.preventDefault();var p=JSON.stringify(e.serializeObject());$.ajax({type:"POST",url:"apis/v1/apps",headers:{Accept:"application/json","Content-Type":"application/json; charset=utf-8"},data:p,success:function(t){e.closest(".modal").modal("hide"),e.trigger("reset"),void 0==x.apps&&(x.apps=[]),x.apps.unshift(t),o(),n(t.id)},error:function(t,e,o){400==t.status?$("text",a).text("您输入的名称已被使用，请更换一个名称"):$("text",a).text("输入信息处理错误,请稍后重试。"),a.removeClass("hide")}})}})}function v(){t(),h()}var x={};return $(document).ajaxComplete(function(t,e,a){401===e.status&&window.location.replace("/auth/login?redirect_uri="+encodeURI(window.location.href))}),x.statusLocal={active:{name:"开发中",color:"palette-Green text",showPublish:!0,info:"开发中的APP最多允许10个用户授权登录，如果需要更多用户，请点击右侧的【更多】---> 【发布到应用中心】"},banned:{name:"被停用",color:"palette-Deep-Orange text",info:"您的应用可能因名称，隐私政策等被管理员停用，请核对相关名称和政策，如有问题，请联系管理员"},active_incenter:{name:"已经发布到应用中心",href:"/appcenter",color:"palette-Light-Blue text",info:"您的应用已成功发布到应用中心, 请点击跳转到应用中心搜索",showUnpublish:!0},active_review:{name:"应用中心审核中",color:"palette-Amber text",info:"应用中心审核中，请耐心等待",showUnpublish:!1,showUnreview:!0},active_scopes_review:{name:"高级权限审核中",color:"palette-Amber text",info:"高级权限审核需要主动校方联系工作人员，否则不予通过",showUnpublish:!0},active_center_banned:{name:"应用中心审核失败",color:"palette-Red text",info:"您的应用可能因名称，功能，私政策等审核失败，请确保您的应用实现自动账户登录，如有问题，请联系管理员",showPublish:!0}},x.advancedScopes=[{id:"tiup",summary:"同步用户数据",description:"同步TiUP平台数据到学校"},{id:"datacenter",summary:"同步群组数据中心",description:"同步数据中心数据到学校"},{id:"login",summary:"自动登录集成",description:"用户从您的当前系统跳转到本系统时，无需登录。"}],{init:v,data:x,createApp:f,deleteApp:d,showAppDetail:n,resetAppSecret:u,editApp:i,publishApp:c,unpublishApp:l,revokeAppUsers:a,regAppScope:p,loadMore:e,cancelAppScope:r}}();jQuery(document).ready(function(){AppOpen.init()});
var AppOpen = (function () {
    var Data ={};

    //ajax error redirect
    $(document).ajaxComplete(function(e, xhr, settings){
        if(xhr.status === 401) {
            window.location.replace("/auth/login?redirect_uri="+  encodeURI(window.location.href));
        }
    });

    Data.statusLocal = {
        active : {
            name:"开发中",
            color:"palette-Blue text",
            showPublish:true,
            info:'开发中的APP最多允许10个用户授权登录，如果需要更多用户，请点击右侧的【更多】---> 【发布到应用中心】'
        },
        banned:{
             name:"被停用",
             color:"palette-gray text",
             info:"您的应用可能因名称，隐私政策等被管理员停用，请核对相关名称和政策，如有问题，请联系管理员"
        },
        active_incenter:{
            name:"已经发布到应用中心",
            href:"/appcenter",
            color:"palette-Light-Blue text",
            info:"您的应用已成功发布到应用中心, 请点击跳转到应用中心搜索",
            showUnpublish:true
        },
        active_review:{
            name:"应用中心审核中",
            color:"palette-Amber text",
            info:"应用中心审核中，请耐心等待",
            showUnpublish:false,
            showUnreview:true
        },
        active_scopes_review:{
            name:"高级权限审核中",
            color:"palette-Amber text",
            info:"高级权限审核需要主动校方联系工作人员，否则不予通过",
            showUnpublish:true
        },
        active_center_banned:{
            name:"应用中心审核失败",
            color:"palette-Red text",
            info:"您的应用可能因名称，功能，私政策等审核失败，请确保您的应用实现自动账户登录，如有问题，请联系管理员",
            showPublish:true
        }
    };


    Data.advancedScopes = [
        {
            "id": "tiup",
            "summary": "同步用户数据",
            "description": "同步TiUP平台数据到学校"
        },
        {
            "id": "datacenter",
            "summary": "同步群组数据中心",
            "description": "同步数据中心数据到学校"
        },
        {
            "id": "login",
            "summary": "自动登录集成",
            "description": "用户从您的当前系统跳转到本系统时，无需登录。"
        }
    ];

    function loadApps() {
        $.ajax({
            type: "GET",
            cache: false,
            url: "apis/v1/apps",
            dataType: "json",
            headers: {'Accept': 'application/json'},
            success: function (data) {
                Data.apps = data;
                showApps();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                var template = $('#apps-table-error').html();
                $('#apps-table').html(Mustache.render(template, {error: ""}));
            }
        });
    }



    function loadMore(button, clientId)  {
        var morescope = $(button).closest('.btn-group').find('.more-scopes');
        $.ajax({
            type: "GET",
            cache: false,
            url: "apis/v1/apps/" + clientId + "/more_scopes",
            dataType: "json",
            headers: {'Accept': 'application/json'},
            success: function (data) {
                morescope.html('<a href="javascript:AppOpen.cancelAppScope(' + "'"  + clientId  + "'"  + ')">取消高级授权申请</a>')
            },
            error: function (xhr, ajaxOptions, thrownError) {
                morescope.html('<a href="javascript:AppOpen.regAppScope(' + "'"  + clientId  + "'"  + ')">申请高级权限</a>')
            }
        });
    }

    function revokeAppUsers(appId) {
        $.ajax({
            type: "GET",
            cache: false,
            url: "apis/v1/apps/" + appId + "/users_count",
            headers: {'Accept': 'application/json'},
            success: function (data) {
                if (data.count == 0) {
                    swal({
                        title: "现在没有用户授权该应用，无需撤销",
                        text: "你可以点击 【应用详情】里的 “获取 authorization code 的链接” 的示例链接体验授权过程。",
                        type: "success",
                        confirmButtonText: "确定"
                    });
                    return
                }
                swal({
                    title: "现在共有 " + data.count + " 个用户授权该应用， 确定撤销授权吗？",
                    text: "撤销授权后，用户进入应用时将需要重新弹出授权界面，且获取到的用户token将立即失效。",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    closeOnConfirm: false
                }, function(){
                    $.ajax({
                        type: "GET",
                        cache: false,
                        url: "apis/v1/apps/" + appId + "/users_revoke",
                        headers: {'Accept': 'application/json'},
                        success: function (data) {
                            swal({
                                title: "已经成功撤销所有用户授权",
                                type: "success",
                                confirmButtonText: "确定"
                            });
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            swal({
                                title: "撤销所有用户授权失败,请稍后重试!",
                                type: "error",
                                confirmButtonText: "确定"
                            });
                        }
                    });
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                swal({
                    title: "数据读取错误,请稍后重试!",
                    type: "error",
                    confirmButtonText: "确定"
                });
            }
        });

    }


    function showApps() {
        var template = $('#apps-table-template').html();
        $('#apps-table-subtitle').html("您最多还可以创建 " + (10-Data.apps.length) + " 个应用");
        for (var i=0;i<Data.apps.length;i++) {
            Data.apps[i].createdatLocal = moment((new Date(Data.apps[i].createdat))).fromNow();
            Data.apps[i].statusLocal = Data.statusLocal[Data.apps[i].status];
        }
        $('#apps-table').html(Mustache.render(template, Data));
        App.toggleTooltip();
    }

    function showAppDetail(appId) {
        for (var i = 0; i < Data.apps.length; i++) {
            if (Data.apps[i].id == appId) {
                var authURL = window.location.origin + "/oauth2/authorize";
                Data.apps[i].authorization_code_url =  authURL + "?response_type=code&scope=userinfo&state=yourstate&client_id=" + appId + "&redirect_uri=" + Data.apps[i].redirecturi + "/callback/oauth"
                $('#modal-app-detail').html(Mustache.render($('#modal-app-detail-template').html(), Data.apps[i]));
                $('#modal-app-detail').modal('show');
                return
            }
        }
    }

    function regAppScope(appId) {
        for (var i = 0; i < Data.apps.length; i++) {
            if (Data.apps[i].id == appId) {
                var data = {
                    name:  Data.apps[i].name,
                    scopes: Data.advancedScopes,
                };
                if (Data.apps[i].allowedscopes != undefined) {
                    var arr = Data.apps[i].allowedscopes.split(" ", -1);
                    for(var i=0; i<arr.length;i++) {
                        for(var j=0; j<data.scopes.length;j++) {
                            if (data.scopes[j].id == arr[i]) {
                                data.scopes[j].acquired = true
                            }
                        }
                    }
                }
                var noscopes = true;
                data.scopes.forEach(function (scope) {
                    if (scope.acquired != true) {
                        noscopes = false
                        return
                    }
                });
                data.nosubmit = noscopes;
                $('#modal-reg-scope').html(Mustache.render($('#modal-reg-scope-template').html(), data));
                $('#modal-reg-scope').modal('show');
                toggleRegScope(appId);
                return
            }
        }
    }

    function cancelAppScope(appId) {
        for (var i = 0; i < Data.apps.length; i++) {
            if (Data.apps[i].id == appId) {
                swal({
                    title: "确定取消申请吗？",
                    text: "取消申请后如需更多权限，您将需要重新申请。",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    closeOnConfirm: false
                }, function(){
                    $.ajax({
                        type: "DELETE",
                        cache: false,
                        url: "apis/v1/apps/" + appId + "/more_scopes",
                        headers: {'Accept': 'application/json'},
                        success: function (data) {
                            swal({
                                title: "取消成功",
                                type: "success",
                                confirmButtonText: "确定"
                            });
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            swal({
                                title: "取消失败!",
                                type: "error",
                                confirmButtonText: "确定"
                            });
                        }
                    });
                });

                return
            }
        }
    }
    function toggleRegScope(appId) {
        $("#modal-reg-scope").find("form").validator().submit(function (e) {
            if (e.isDefaultPrevented()) {
                return
            }
            var form = $(e.target),
                error = $('.alert', form);
            error.addClass("hide");
            e.preventDefault();
            var data = form.serializeArray()

            var hasCopes = false;
            var formData = "scopes=";
            for (var i=0; i< data.length; i++) {
                if (data[i].value == "on") {
                    formData += data[i].name + "%20"
                    hasCopes = true
                }
            }
            if (!hasCopes) {
                $('text', error).text("请选择要申请的高级权限。");
                error.removeClass("hide");
                return
            }
            formData = formData.substr(0, formData.length -3)
            $.ajax({
                type: "POST",
                url: "apis/v1/apps/" + appId + "/more_scopes",
                headers: {'Accept': 'application/json'},
                data: formData,
                success: function (data) {
                    form.trigger("reset");
                    form.closest('.modal').modal('hide');

                    swal({
                        title: "已成功提交审核",
                        text: "请耐心等待审核结果!",
                        type: "success",
                        confirmButtonText: "确定"
                    });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if(xhr.status==400) {
                        $('text', error).text("输入信息处理错误,请重试。");
                    } else {
                        $('text', error).text("信息处理错误,请稍后重试。");
                    }
                    error.removeClass("hide");
                }
            });
        });

    }

    function editApp(appId) {
        for (var i = 0; i < Data.apps.length; i++) {
            if (Data.apps[i].id == appId) {
                $('#modal-edit-app').find('.modal-body').html(Mustache.render($('#modal-edit-app-template').html(), Data.apps[i]));
                $('#modal-edit-app').modal('show');
                toggleEditApp(appId);
                return
            }
        }
    }

    function publishApp(appId) {
        for (var i = 0; i < Data.apps.length; i++) {
            if (Data.apps[i].id == appId) {
                $('#modal-app-publish').html(Mustache.render($('#modal-app-publish-template').html(), Data.apps[i]));
                $('#modal-app-publish').modal('show');
                return
            }
        }
    }

    function unpublishApp(appId) {
        for (var i = 0; i < Data.apps.length; i++) {
            if (Data.apps[i].id == appId) {
                swal({
                    title: "确定撤销发布吗?",
                    text: "撤销发布后，用户将无法在应用中心搜索到您的应用，安装应用的用户也将无法进入应用!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    closeOnConfirm: false
                }, function(){
                    $.ajax({
                        type: "GET",
                        url: "/open/apps/" + appId + "/reset_secret",
                        headers: {'Accept': 'application/json'},
                        success: function (data) {
                            loadApps();
                            swal({
                                title: "撤销发布成功",
                                type: "success",
                                confirmButtonText: "确定"
                            });

                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            swal({
                                title: "系统错误，请稍后重试",
                                type: "error",
                                confirmButtonText: "确定"
                            });
                        }
                    });
                });
                return
            }
        }
    }

    function resetAppSecret(appId) {
        swal({
            title: "确定重置Client Secret吗?",
            text: "重置后原Client Secret 将失效，您可以能需要调整对应程序才能让该应用正常工作!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "重置",
            cancelButtonText: "取消",
            closeOnConfirm: false
        }, function(){
            swal({title:"", showConfirmButton: false, timer:0});
            $.ajax({
                type: "GET",
                url: "apis/v1/apps/" + appId + "/reset_secret",
                headers: {'Accept': 'application/json'},
                success: function (data) {
                    for (var i=0;i<Data.apps.length;i++) {
                        if (Data.apps[i].id== appId) {
                            Data.apps[i] = data;
                            continue;
                        }
                    }
                    showAppDetail(appId)
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    swal({
                        title: "系统错误，请稍后重试",
                        type: "error",
                        confirmButtonText: "确定"
                    });
                }
            });
        });

    }
    function deleteApp(appId) {
        swal({
            title: "确定删除吗?",
            text: "删除应用后，Client ID 和 Client Secret 将失效，相关功能也会被删除!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            closeOnConfirm: false
        }, function(){
            $.ajax({
                type: "DELETE",
                url: "apis/v1/apps/" + appId,
                headers: {'Accept': 'application/json'},
                success: function (data) {
                    for (var i=0;i<Data.apps.length;i++) {
                        if (Data.apps[i].id== appId) {
                            Data.apps.splice(i, 1);
                            $("#apps-table").find("tr:eq(" + i + ")").remove();
                            continue;
                        }
                    }
                    swal({
                        title: "删除成功",
                        type: "success",
                        confirmButtonText: "确定"
                    });
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    swal({
                        title: "系统错误，请稍后重试",
                        type: "error",
                        confirmButtonText: "确定"
                    });
                }
            });
        });
    }


    function createApp() {
        if (Data.apps != undefined && Data.apps.length >= 10) {
            swal({
                title: "您最多只能创建10个应用，请删除部分应用后重试",
                type: "warning",
                confirmButtonText: "确定"
            });
            return
        }
        $('#modal-create-app').find('.modal-body').html(Mustache.render($('#modal-edit-app-template').html(),{}));
        $('#modal-create-app').modal('show');
        toggleAddApp();
    }

    function toggleEditApp(appId) {
        $("#modal-edit-app").find("form").validator().submit(function (e) {
            if (e.isDefaultPrevented()) {
                return
            }
            var form = $(e.target),
                error = $('.alert', form);
            error.addClass("hide");
            e.preventDefault();
            var data = JSON.stringify(form.serializeObject());
            $.ajax({
                type: "PUT",
                url: "apis/v1/apps/" + appId,
                headers: {'Accept': 'application/json', 'Content-Type':'application/json; charset=utf-8'},
                data: data,
                success: function (data) {
                    form.trigger("reset");
                    for (var i=0;i<Data.apps.length;i++) {
                        if (Data.apps[i].id==data.id)
                        Data.apps[i] = data;
                        continue
                    }
                    form.closest('.modal').modal('hide');
                    showApps();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if(xhr.status==400) {
                        $('text', error).text("您输入的名称已被使用，请更换一个名称");
                    } else {
                        $('text', error).text("输入信息处理错误,请稍后重试。");
                    }
                    error.removeClass("hide");
                }
            });
        });
    }
    function toggleAddApp() {
        $("#modal-create-app").find("form").validator().submit(function (e) {
            if (e.isDefaultPrevented()) {
               return
            }
            var form = $(e.target),
                error = $('.alert', form);
            error.addClass("hide");
            e.preventDefault();
            var data = JSON.stringify(form.serializeObject());
            $.ajax({
                type: "POST",
                url: "apis/v1/apps",
                headers: {'Accept': 'application/json', 'Content-Type':'application/json; charset=utf-8'},
                data: data,
                success: function (data) {
                    form.closest('.modal').modal('hide');
                    form.trigger("reset");
                    if(Data.apps == undefined) {
                        Data.apps = [];
                    }
                    Data.apps.unshift(data);
                    showApps();
                    showAppDetail(data.id);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if(xhr.status==400) {
                        $('text', error).text("您输入的名称已被使用，请更换一个名称");
                    } else {
                        $('text', error).text("输入信息处理错误,请稍后重试。");
                    }
                    error.removeClass("hide");
                }
            });
        });
    }



    function init() {
        loadApps();
        toggleAddApp();
    }

    return {
        init: init,
        data:Data,
        createApp:createApp,
        deleteApp:deleteApp,
        showAppDetail:showAppDetail,
        resetAppSecret:resetAppSecret,
        editApp:editApp,
        publishApp:publishApp,
        unpublishApp:unpublishApp,
        revokeAppUsers:revokeAppUsers,
        regAppScope:regAppScope,
        loadMore: loadMore,
        cancelAppScope:cancelAppScope
    };
})();

jQuery(document).ready(function () {
    AppOpen.init();
});

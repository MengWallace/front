var AppDocs = (function () {
    var Data ={};
    var defaultLocation = "oauth 2.0";

    /**
     lunr.trimmer = function (token) {
        if(isChineseChar(token)){
            return token;
        }
        return token
            .replace(/^\W+/, '')
            .replace(/\W+$/, '')
    };

     function isChineseChar(str){
        var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
        return reg.test(str);
    }

     var index = lunr(function () {
        this.field('title', {boost: 10});
        this.field('text');
        this.ref('id');
    });
     */


    function getToc (sel) {
        var documentRef = document.querySelector(sel)
        var toc = '<ul><li><a href="#content">目录</a>';
        var level = 2;
        var headings = [].slice.call(documentRef.querySelectorAll('h2, h3'));
        if (headings.length<2) {
            return ""
        }
        headings.forEach(function (heading, index) {
            var hIndex = parseInt(heading.nodeName.substring(1));
            var append =  '<li><a href="#' + heading.id + '">' + heading.innerText + '</a>';

            if (hIndex > level ) { //上一个是h1, 现在是h2 应该+ <ul><li><a href="#webapp">Web应用</a>
                append = '<ul>' + append;
            } else if (hIndex < level )  {
                //应该加：</li></ul></li><li><a href="#expiration">Token过期制</a>
                append = '</li></ul></li>' + append;
            }
            toc += append;
            level = hIndex;
        });
        appendEnd = '</li></ul>';
        if (level > 2) {
            appendEnd = '</li></ul></li></ul>';
        }
        toc += appendEnd;
        return '<nav class="doc_nav">' + toc + '</nav>';
    }

    function toggleToc() {
        if ($('.doc_body')[0]) {
            var toc = getToc(".doc_body");
            $(".doc_nav_container").html(toc);
            if (toc == "") {
                return
            }
            $(".doc_nav  a").on('click', function () {
                $('.doc_nav a.active').removeClass('active');
                if ($(this).attr('href') != "#content") {
                    $(this).addClass('active');
                }
            });
            $(window).scroll(function () {
                var windscroll = $(window).scrollTop();
                if (windscroll >= 0) {
                    $('.doc_body h2,.doc_body h3').each(function (i) {
                        if ($(this).position().top <= windscroll - 60) {
                            var id = $(this).attr('id');
                            if(id != undefined) {
                                $('.doc_nav a.active').removeClass('active');
                                $('.doc_nav a[href="#' + $(this).attr('id') + '"]').addClass('active');
                            }
                        }
                    });
                }
            }).scroll();

            $(window).scroll(function () {
                if($( document ).width()<1024) {
                    return
                }
                var scroll_top = $(this).scrollTop(); // get scroll position top
                var height_element_parent = $(".doc_body").height(); //get high parent element
                var height_element = $(".doc_nav").height(); //get high of elemeneto
                var position_fixed_max = height_element_parent - height_element; // get the maximum position of the elemen
                var position_fixed = scroll_top < 115 ? 160 - scroll_top : position_fixed_max > scroll_top ? 85 : position_fixed_max - scroll_top;
                $(".doc_nav").css("top", position_fixed);
            });
        }
    }


    Data.cahcedDocs = [];

    function loadDoc(location) {
        for(var i=0;i < Data.cahcedDocs.length;i++) {
            if (Data.cahcedDocs[i].location == location) {
                $('.doc_body').html(Data.cahcedDocs[i].html);
                toggleToc();
                toggleInternalMd($('.doc_body'));
                return
            }
        }
        $.ajax({
            type: "GET",
            url: "apis/docs/" + location + ".html",
            dataType: "html",
            success: function (data) {
                $('.doc_body').html(data);
                Data.cahcedDocs.push({
                    location:location,
                    html:data
                });
                toggleToc();
                toggleInternalMd($('.doc_body'))
            }
        });
    }


    $(window).on("popstate", function(state) {
        if(state === null) {
        } else {
            var location = decodeURI(window.location.hash).substr(8, window.location.hash.length);
            goTo(location,true)
        }
    });

    function goTo(location,isback) {
        window.scrollTo(0, 0);
        if (!window.location.pathname.endsWith('/docs.html')) {
            window.location.replace(window.location.pathname.replace(/\/[^//]+$/, "") + '/docs.html' + "#/pages/" + location)
            return
        }
        location = location.toLowerCase();
        if (isback != true) {
            window.history.pushState(location, "开发者中心文档", window.location.pathname + "#/pages/" + location);
        }
        $('.main-menu li.active').removeClass('active');
        $('.main-menu').find('a[href="' + location + '"]').parent("li").addClass('active');
        loadDoc(location);
        initIndex(location);
    }


    function initIndex(location) {
        location = decodeURI(location)
        if (Data.index != undefined) {
            for (var i=0; i< Data.index.length;i++) {
                if (Data.index[i].location == location) {
                    $(".c-header").find("h2").text(Data.index[i].title);
                }
            }
            return
        }
        $.ajax({
            type: "GET",
            url: "apis/docs/_index.json",
            dataType: "json",
            headers: {'Accept': 'application/json'},
            success: function (data) {
                Data.index = data;
                for (var i=0; i< Data.index.length;i++) {
                    if (Data.index[i].location == location) {
                        $(".c-header").find("h2").text(Data.index[i].title);
                    }
                }
            }
        });

    }

    var textToColor = function (text) {
        var num = 0;
        for (var i = 0; i < text.length; i++) {
            num += text.charCodeAt(i);
        }
        const hue = num % 360;
        return "hsl(" + hue + ",60%,75%)";
    };

    function loadProfile() {
        $("#login").on("click", function (e) {
            e.preventDefault();
            window.location.href = "/auth/login?redirect_uri=" + encodeURI(window.location.href)
        });
        $.ajax({
            type: "GET",
            cache: false,
            url: "/auth/apis/preference/profile",
            dataType: "json",
            headers: {'Accept': 'application/json'},
            success: function (data) {
                if(data.identification==undefined || data.identification=="") {
                        $("#real-name-verrified").removeClass("hide")
                        $("#main-card").addClass("hide")
                } else {
                    $("#real-name-verrified").addClass("hide")
                    $("#main-card").removeClass("hide")
                }
                $("#login").addClass("hide");
                $("header").find('.avatar').attr("style", "background:" + textToColor(data.name));
                $("header").find('.avatar').text(data.name.charAt(0));
                $(".hm-profile").removeClass("hide");
            }
        });
    }

    function init() {
        loadProfile();
        if (!window.location.pathname.endsWith('docs.html')) {
            return
        }
        var currentLocation = defaultLocation;
        if (window.location.hash != undefined && !(window.location.hash.indexOf("#/pages/"))) {
            currentLocation =  decodeURI(window.location.hash).substr(8, window.location.hash.length);
        }
        goTo(currentLocation);
        toggleInternalMd();
    }

    function toggleInternalMd(ele) {
        if (ele == undefined) {
            $("[data-internalmd]").on("click", function (e) {
                e.preventDefault();
                goTo($(this).attr('href'));
            });
        } else  {
            ele.find("[data-internalmd]").on("click", function (e) {
                e.preventDefault();
                goTo($(this).attr('href'));
            });
        }
    }


    return {
        init: init,
        toggleInternalMd:toggleInternalMd
    };


})();

jQuery(document).ready(function () {
    AppDocs.init();
});

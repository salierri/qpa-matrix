var idleTime = 0;
var countdown = 0;
var lastColor = null;
var wasChange = false;
var nopixel = true;

function keepalive() {
    var session = localStorage.getItem("matrixsession");
    $.ajax({
        type: "POST",
        url: "/connection/keepalive",
        contentType: "application/json",
        data: JSON.stringify({"session": session}),
        success: function(response) {
            updatePage(response);
        }
    });
}

function postPixels() {
    //alert(localStorage.getItem("matrixsession"));
    var session = localStorage.getItem("matrixsession");
    //alert(session);
    if(session === null) {
        reserve();
    } else {
        $.ajax({
            type: "POST",
            url: "/pixels",
            contentType: "application/json",
            data: JSON.stringify({"session": session}),
            success: function(response) {
                processResponse(response, "resend");
        }});
    }
}

function dropMe() {
    var session = localStorage.getItem("matrixsession");
    localStorage.removeItem("matrixsession");
    $.ajax({
        type: "POST",
        url: "/connection/drop",
        contentType: "application/json",
        data: JSON.stringify({"session": session})
    });
}

function reserve() {
    $.ajax({
        type: "GET",
        url: "/pixels/reserve",
        contentType: "application/json",
        success: function(response){
            processResponse(response, "initial");
    }});
}

function updatePixel(color) {
    var session = localStorage.getItem("matrixsession");
    $.ajax({
        type: "POST",
        url: "/pixels/update",
        contentType: "application/json",
        data: JSON.stringify({"session": session, "color": color}),
        success: function(response) {
            updatePage(response);
    }});
}

 function getAndroidVersion(ua) {
    ua = (ua || navigator.userAgent).toLowerCase(); 
    var match = ua.match(/^(.(?!windows))*android\s([0-9\.]*)/);
    return match ? match[2] : false;
}

$(document).ready(function () {

    var idleInterval = setInterval(timerIncrement, 60000);
    var countdownInterval = setInterval(timerDecrement, 1000);
    var updateInterval = setInterval(periodicUpdate, 250);
    

    //Zero the idle timer on mouse movement.
    $(this).mousemove(function (e) {
        if(idleTime === 1) {
            keepalive();
        }
        idleTime = 0;
    });
    
    $(this).keypress(function (e) {
        if(idleTime === 1) {
            keepalive();
        }
        idleTime = 0;
        
    });
    
    $(window).bind('beforeunload', function () {
        dropMe();
    });
    
    if(parseFloat(getAndroidVersion()) <= 4.1) {
        var fosstyle = $('<style>');
        fosstyle.html(
            "input[type=range]::-webkit-slider-runnable-track {\
              width: 100%;\
              height: 8.4px;\
              cursor: pointer;\
              animate: 0.2s;\
              box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;\
              background: #3071a9;\
              border-radius: 1.3px;\
              border: 0.2px solid #010101;\
            }\
            input[type=range]::-webkit-slider-thumb {\
              box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;\
              border: 1px solid #000000;\
              height: 36px;\
              width: 16px;\
              border-radius: 3px;\
              background: #ffffff;\
              cursor: pointer;\
              -webkit-appearance: none;\
              margin-top: -14px;\
            }\
            input[type=range]:focus::-webkit-slider-runnable-track {\
              background: #367ebd;\
            }"
        );
        
        $('head').append(fosstyle);
        $('#red').addClass("fosbackground");
        $('#green').addClass("fosbackground");
        $('#blue').addClass("fosbackground");
    }
    
});

function processResponse(response, requestType) {
    var data = JSON.parse(response);
    //alert(response);
    if(data.status === "reserved" || data.status === "haspixel") {
        if(nopixel)
        {
            alert("You got a new pixel!");
            nopixel = false;
        }
        
        if(!wasChange) {
            $("#red").val(data.pixel.color.r);
            $("#green").val(data.pixel.color.g);
            $("#blue").val(data.pixel.color.b);
            $("#colorshow").css('background', "rgb(" + data.pixel.color.r + "," + data.pixel.color.g + "," + data.pixel.color.b + ")");
        }
        
        //!!!!!!SET VERSION HERE!!!!!!!
        var pixeldata = pixelFromCoord20(data.pixel);
        $("#pixelLocation").html(
            "A pixeled helye:<br>" + pixeldata.szint  + ". szint<br>"
            + pixeldata.ablak + ". ablak<br>"
            + (pixeldata.bal === 0 ? "bal" : pixeldata.bal === 1 ? "középső" : "jobb") + " "
            + (pixeldata.felso === 0 ? "felső" : pixeldata.felso === 1 ? "középső" : "alsó") + " pixel"
        );
        
        showColorTable(true);
        
        if(requestType === "initial") {
            localStorage.setItem("matrixsession", data.session);
        }
    } else if (data.status === "queue") {
        nopixel = true;
        countdown = Math.ceil(data.nextRealloc / 1000);
        showColorTable(false);   
        
        if(requestType === "initial") {
            localStorage.setItem("matrixsession", data.session);
        }
    } else {
        nopixel = true;
        if(requestType === "resend") {
            localStorage.removeItem("matrixsession");
        }
        reserve();
    }
}

function updatePage(response) {
    var data = JSON.parse(response);
    if(data.status === "success") {
        if(data.nextRealloc === false) {
            countdown = -1;
        } else {
            countdown = Math.ceil(data.nextRealloc / 1000);
        }
        if(data.hasPixel === undefined || data.hasPixel) {
            showColorTable(true);
        } else {
            showColorTable(false);
        }
    } else if(data.status === "nopixel") {
        countdown = Math.ceil(data.nextRealloc / 1000);
        showColorTable(false);
    } else {
        localStorage.removeItem("matrixsession");
        reserve();
    }
}

function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime === 2) {
        alert("Ha nem használod az alkalmazást, elveszhet a pixeled!");
    }
}

function timerDecrement() {
    countdown = countdown - 1;
    $("#countdownLocation").html = '<p style="font-size:100px">' + Math.max(countdown, 0) +'</p>';
    if (countdown === -1) {
        postPixels();
    }
}

function periodicUpdate() {
    if(wasChange) {
        updatePixel(lastColor);
        wasChange = false;
    }
}

function showColorTable(visible){
    if(visible) {
        $("#colortable").css('display', "block");
        $("#countdown").css('display', "none");
    } else {
        $("#colortable").css('display', "none");
        $("#countdown").css('display', "block");
    }
}

function pixelFromCoord20(coord) {
    var szint = 18 - Math.floor(coord.y / 2);
    var ablak = Math.floor(coord.x / 2) + 1;
    var bal = (coord.x % 2) * 2;
    var felso = (coord.y % 2) * 2;
    return {"szint": szint, "ablak": ablak, "bal": bal, "felso": felso};
}

function pixelFromCoord30(coord) {
    var szint = 18 - Math.floor(coord.y / 3);
    var ablak = Math.floor(coord.x / 3) + 1;
    var bal = (coord.x % 3);
    var felso = (coord.y % 3);
    return {"szint": szint, "ablak": ablak, "bal": bal, "felso": felso};
}

function changeColor() {
    var r = $("#red").val();
    var g = $("#green").val();
    var b = $("#blue").val();
    var colorsheet = $("#colorshow");
    colorsheet.css('background', "rgb(" + r + "," + g + "," + b + ")");
    var color = {"r": r, "g": g, "b": b};
    
    if(color != lastColor) {
        lastColor = color;
        wasChange = true;
    }
}
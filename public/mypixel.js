var idleTime = 0;
var countdown = 0;
var lastColor = null;
var wasChange = false;
var nopixel = true;
// !!!!!!SET VERSION HERE!!!!!!!
var version = 2;
allLog = "";
loging = true;

function log(msg) {
    if(loging) {
        allLog += (new Date().toISOString() + "\t" + msg + "\n");
    }
}

function sendLog() {
    log("The end");
    
    $.ajax({
        type: "POST",
        url: "/bfbadmin/log",
        contentType: "application/json",
        data: JSON.stringify({"log": allLog})
    });
}

function keepalive() {
    log("Keep me alive");
    
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
    log("I post to pixels");
    
    var session = localStorage.getItem("matrixsession");
    
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
    log("Drop me");

    var session = localStorage.getItem("matrixsession");
    localStorage.removeItem("matrixsession");
    $.ajax({
        type: "POST",
        url: "/connection/drop",
        contentType: "application/json",
        data: JSON.stringify({"session": session})
    });
    
    if(loging) {
        sendLog();
    }
}

function reserve() {
    log("Hello");
    
    $.ajax({
        type: "GET",
        url: "/pixels/reserve",
        contentType: "application/json",
        success: function(response){
            processResponse(response, "initial");
    }});
}

function updatePixel(color) {
    log("Update my pixel");

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
        log("I'm that kind of android");
    
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
        if(nopixel) {
            log("I got a pixel");
            
            alert("You got a new pixel!");
            nopixel = false;
        }
        
        if(!wasChange) {
            $("#red").val(data.pixel.color.r);
            $("#green").val(data.pixel.color.g);
            $("#blue").val(data.pixel.color.b);
            $("#colorshow").css('background', "rgb(" + data.pixel.color.r + "," + data.pixel.color.g + "," + data.pixel.color.b + ")");
        }
        
        var pixeldata = pixelFromCoord(data.pixel, version);
        $("#pixelLocation").html(
            "A pixeled helye:<br>" + pixeldata.szint  + ". szint<br>"
            + pixeldata.ablak + ". ablak<br>"
            + (pixeldata.bal === 0 ? "bal" : pixeldata.bal === 1 ? "középső" : "jobb") + " "
            + (pixeldata.felso === 0 ? "felső" : pixeldata.felso === 1 ? "középső" : "alsó") + " " + (version === 2 ? "negyed" : "kilenced")
        );
        
        showColorTable(true);
        
        if(data.suggested)
        {
           setSuggested(data.suggested);
        }
        
        if(requestType === "initial") {
            log("My session: " + data.session);
        
            localStorage.setItem("matrixsession", data.session);
        }
    } else if (data.status === "queue") {
        log("I'm in queue");
        
        nopixel = true;
        countdown = Math.ceil(data.nextRealloc / 1000);
        showColorTable(false);   
        
        if(requestType === "initial") {
            log("My session: " + data.session);
            
            localStorage.setItem("matrixsession", data.session);
        }
    } else {
        nopixel = true;
        if(requestType === "resend") {
            log("I lost my session");
        
            localStorage.removeItem("matrixsession");
        }
        reserve();
    }
}

function setSuggested(suggested) {
    var suggestedPixel = ('#suggestedPixel');
    var suggestedColor = ('#suggestedColor');
    suggestedPixel.css("display", "block");
    suggestedColor.css("background", "rgb(" + suggested.r + "," + suggested.g + "," + suggested.b + ")");
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
            log("My pixel updated");
        
            showColorTable(true);
        } else {
            log("I don't have a pixel");
        
            showColorTable(false);
        }
        
        if(data.suggested)
        {
           setSuggested(data.suggested);
        }
    } else if(data.status === "nopixel") {
        log("I lost my pixel")
        
        countdown = Math.ceil(data.nextRealloc / 1000);
        showColorTable(false);
        nopixel = true;
    } else {
        log("I lost my session");
        
        nopixel = true;
        localStorage.removeItem("matrixsession");
        reserve();
    }
}

function timerIncrement() {
    idleTime = idleTime + 1;
    if (idleTime === 2) {
        log("I'm lazy");
    
        alert("Ha nem használod az alkalmazást, elveszhet a pixeled!");
    }
}

function timerDecrement() {
    countdown = countdown - 1;
    $("#countdownLocation").html('<p style="font-size:100px">' + Math.max(countdown, 0) +'</p>');
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
        $("#chooser").css('display', "block");
        $("#countdown").css('display', "none");
    } else {
        $("#chooser").css('display', "none");
        $("#countdown").css('display', "block");
    }
}

function pixelFromCoord(coord, version) {
    var szint = 18 - Math.floor(coord.y / version);
    var ablak = Math.floor(coord.x / version) + 1;
    var bal = (coord.x % version);
    var felso = (coord.y % version);
    if(version === 2){
        bal *= 2;
        felso *= 2;
    }
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
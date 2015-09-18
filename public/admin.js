var statsarecoming = false;

function tryPw() {
    var pw = $('#pw').val();
    $.ajax({
        type: "POST",
        url: "/bfbadmin",
        contentType: "application/json",
        headers: {
            "Bfb-Admin-Key" : pw
        },
        success: function(response) {
            triedPW(response, true);
        }
    });
}

function getStats() {
    var pw = $('#pw').val();
    $.ajax({
        type: "GET",
        url: "/bfbadmin/stats",
        contentType: "application/json",
        headers: {
            "Bfb-Admin-Key" : pw
        },
        success: function(response) {
            showStats(response);
        }
    });
}

function suggestImage(doSuggest) {
    var pw = $('#pw').val();
    var img = 0;
    
    if(doSuggest) {
        var img = $('#imgselect').val();
    }
        
    $.ajax({
        type: "POST",
        url: "/bfbadmin/image",
        contentType: "application/json",
        headers: {
            "Bfb-Admin-Key" : pw
        },
        data: JSON.stringify({"image": img}),
        success: function(response) {
            triedPW(response, true);
        }
    });
}

function reset() {
    var pw = $('#pw').val();
    $.ajax({
        type: "POST",
        url: "/bfbadmin/reset",
        contentType: "application/json",
        headers: {
            "Bfb-Admin-Key" : pw
        },
        success: function(response) {
            triedPW(response, true);
        }
    });
}

function triedPW(response, showIfSucces) {
    data = JSON.parse(response);
    if(data.status === "success") {
        if(showIfSucces){
            alert("pw correct, request success");
        }
        return true;
    } else {
        alert("you shall not use this site!");
        return false;
    }
}

function showStats(response) {
    if(triedPW(response, false)) {
        data = JSON.parse(response);
        var usercount = $('#usercount');
        usercount.html(data.userCount);
        var userpixels = $('#userpixels');
        userpixels.html(data.usersWithPixels);
        var userqueue = $('#userqueue');
        userqueue.html(data.usersInQueue);
        var empty = $('#empty');
        empty.html(data.emptyPixels);
        var retime = $('#retime');
        retime.html(data.nextRealloc ? data.nextRealloc : "n/a")
    } else {
        statsarecoming = false;
    }
}

function getStatsPeriodic() {
    if(statsarecoming)
    {
        getStats();
    }
}

var suggestions = [
    {"name":"piros", "id":1},
    {"name":"sakktábla", "id":2}
];

function setupSuggest() {
    var imgselect = $('#imgselect');
    for (var suggestion of suggestions) {
        imgselect.append(
            $('<option>')
                .text(suggestion.name)
                .val(suggestion.id)
        );
    }
}

$(document).ready(function () {
    var idleInterval = setInterval(getStatsPeriodic, 2000);
    setupSuggest();
});

function stats(startIt) {
    if(startIt) {
        getStats();
        statsarecoming = true;
    } else {
        statsarecoming = false;
    }
}
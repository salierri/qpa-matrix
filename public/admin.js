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
            triedPW(response);
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

function triedPW(response) {
    data = JSON.parse(response);
    if(data.status === "success") {
        alert("correct pw");
    } else {
        alert("you shall not use this site!");
    }
}

function showStats(response) {
    data = JSON.parse(response);
    if(data.status === "success") {
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
        alert("incorrect pw");
        statsarecoming = false;
    }
}

function getStatsPeriodic() {
    if(statsarecoming)
    {
        getStats();
    }
}

$(document).ready(function () {
    var idleInterval = setInterval(getStatsPeriodic, 2000);
});

function stats(startIt) {
    if(startIt) {
        getStats();
        statsarecoming = true;
    } else {
        statsarecoming = false;
    }
}
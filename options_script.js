var bg = chrome.extension.getBackgroundPage();
var status = document.getElementById("status");
var status2 = document.getElementById("status2");

document.addEventListener('DOMContentLoaded', function () {
chrome.storage.sync.get(['seconds', 'reload', 'inactive', 'autostart', 'noRefreshTabs', 'reloadTabIds'], function (settings) {
        document.getElementById("seconds").value = settings.seconds || 10;
        document.getElementById("reload").checked = !!settings.reload;
        document.getElementById("inactive").checked = !!settings.inactive;
        document.getElementById("autostart").checked = !!settings.autostart;
        var rtIds = settings.reloadTabIds || [];

        chrome.tabs.query({
            windowId: chrome.windows.WINDOW_ID_CURRENT
        }, function (tabs) {
            var tabList = document.getElementById("tab-list");
            tabList.innerHTML = "";
            tabs.forEach(function (t) {
                var checked = rtIds.indexOf(t.id) > -1 ? 'checked="checked"' : "";
                tabList.innerHTML += "<li><label><input type='checkbox' value='" + t.id + "' " + checked + " />&nbsp;" + t.title + "</label></li>";
            });
        })
});
});

function save_options () {
    var seconds = parseInt(document.getElementById("seconds").value || "10", 10);
    var reload = document.getElementById("reload").checked;
    var inactive = document.getElementById("inactive").checked;
    var autostart = document.getElementById("autostart").checked;

    // todo ... may start thinking about saving this as urls liek they're blacklist url
    var reloadTabIds = [].map.call(document.querySelectorAll("#tab-list input:checked"), function (input) {
        return parseInt(input.value, 10);
    });

    status.innerHTML = status2.innerHTML = "Saving Options";

    chrome.storage.sync.set({
        'seconds': seconds,
        'reload': reload,
        'inactive': inactive,
        'autostart': autostart,
        'reloadTabIds': reloadTabIds
    });
    setTimeout(function() {
    status.innerHTML = status2.innerHTML = "";
    }, 3000);
}

[].forEach.call(document.querySelectorAll(".save-btn"), function (btn) { btn.addEventListener('click', save_options); });

// Saves options to localStorage.
// function save_options() {
//         localStorage["seconds"] = document.getElementById("seconds").value;
//         bg.timeDelay = (document.getElementById("seconds").value*1000);
//         if (document.getElementById("reload").checked == true) {
//                 localStorage["reload"] = 'true';
//                 bg.tabReload = true;
//         } else {
//                 localStorage["reload"] = 'false';
//                 bg.tabReload = false;
//         }
//         if (document.getElementById("inactive").checked == true) {
//                 localStorage["inactive"] = 'true';
//                 bg.tabInactive = true;
//         } else {
//                 localStorage["inactive"] = 'false';
//                 bg.tabInactive = false;
//         }
// 	if (document.getElementById("autostart").checked == true) {
//                 localStorage["autostart"] = 'true';
//                 bg.tabInactive = true;
//         } else {
//                 localStorage["autostart"] = 'false';
//                 bg.tabInactive = false;
//         }
// 	localStorage["noRefreshList"] = JSON.stringify(document.getElementById('noRefreshList').value.split('\n'));
//         bg.noRefreshList = document.getElementById('noRefreshList').value.split('\n');
//   // Update status to let user know options were saved.
//   var status = document.getElementById("status");
//   var status2 = document.getElementById("status2");
//   status.innerHTML = "OPTIONS SAVED";
//   status2.innerHTML = "OPTIONS SAVED";
//   setTimeout(function() {
//     status.innerHTML = "";
//     status2.innerHTML = "";
//   }, 1000);
// }
// // Restores saved values from localStorage.
// function restore_options() {
//         if (localStorage["seconds"]) {
//                 document.getElementById("seconds").value = localStorage["seconds"];
//         } else {
//                 document.getElementById("seconds").value = "10";
//         }
//         if (localStorage["reload"]) {
//                 if (localStorage["reload"] == 'true') {
//                         document.getElementById("reload").checked = true;
//                 } else {
//                         document.getElementById("reload").checked = false;
//                 }
//         } else {
//                 document.getElementById("reload").checked = true;
//         }
//         if (localStorage["inactive"]) {
//                 if (localStorage["inactive"] == 'true') {
//                         document.getElementById("inactive").checked = true;
//                 } else {
//                         document.getElementById("inactive").checked = false;
//                 }
//         } else {
//                 document.getElementById("inactive").checked = true;
//         }
// 	if (localStorage["autostart"]) {
//                 if (localStorage["autostart"] == 'true') {
//                         document.getElementById("autostart").checked = true;
//                 } else {
//                         document.getElementById("autostart").checked = false;
//                 }
//         } else {
//                 document.getElementById("autostart").checked = false;
//         }
//         if (localStorage["noRefreshList"]) {
//                 document.getElementById("noRefreshList").value = JSON.parse(localStorage["noRefreshList"]).join("\n");
//         } else {
//                 document.getElementById("noRefreshList").value = "";
//         }
// }

// Adding listeners for restoring and saving options
// document.addEventListener('DOMContentLoaded', restore_options);
// document.querySelector('#save').addEventListener('click', save_options);
// document.querySelector('#savetop').addEventListener('click', save_options);

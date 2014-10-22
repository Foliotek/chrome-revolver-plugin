var bg = chrome.extension.getBackgroundPage();
var status = document.getElementById("status");
var status2 = document.getElementById("status2");

document.addEventListener('DOMContentLoaded', function () {
chrome.storage.sync.get(bg.settings, function (settings) {
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
  });
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

  var settings = {
    'seconds': seconds,
    'reload': reload,
    'inactive': inactive,
    'autostart': autostart,
    'reloadTabIds': reloadTabIds
  };

  chrome.windows.getCurrent(function (win) {
    var inst = bg.getInstance(win.id);
    inst.update(settings);
  });
  chrome.storage.sync.set(settings);
  setTimeout(function() {
      status.innerHTML = status2.innerHTML = "";
  }, 3000);
}

[].forEach.call(document.querySelectorAll(".save-btn"), function (btn) { btn.addEventListener('click', save_options); });


var settings = ['seconds', 
  'reload', 
  'inactive', 
  'autostart', 
  'noRefreshList', 
  'reloadTabIds'
];
var instances = { };
var currentWindow = -2;
var globalConfig;

function getInstance (windowId) {
  return instances[windowId.toString()];
}

function activeWindowChange (id) {
  currentWindow = id;
  updateBadgeForInstance(getInstance(id));
}

function init (config) {
  globalConfig = config;
  chrome.windows.getAll(function (windows) {
    [].forEach.call(windows, function (win) {
      var p = instances[win.id.toString()] = new ReloadPlugin(config);
      p.currentWindow = win.id;

      if (win.focused) {
        activeWindowChange(win.id);
      }
    });
  });

  var badgeColor = [139,137,137,137];
  chrome.browserAction.setBadgeBackgroundColor({color: badgeColor});
}

function updateBadgeForInstance (inst) {
  if (inst && inst.isGoing) {
    chrome.browserAction.setBadgeText({text:"\u2022"});
    chrome.browserAction.setBadgeBackgroundColor({color:[0,255,0,100]});
    chrome.browserAction.setTitle({title: 'Revolver - Enabled'});
  }
  else {
    chrome.browserAction.setBadgeText({text:"\u00D7"});
    chrome.browserAction.setBadgeBackgroundColor({color:[255,0,0,100]});
    chrome.browserAction.setTitle({title: 'Revolver - Disabled'});
  }
}

chrome.storage.sync.get(settings, init);
chrome.browserAction.onClicked.addListener(function () {
  chrome.windows.getCurrent(function (win) {
    var instance = getInstance(win.id);
    if (instance.isGoing) {
      instance.stop();
    }
    else {
      instance.start();
    }
    updateBadgeForInstance(instance);
  });
});

chrome.windows.onFocusChanged.addListener(activeWindowChange);
chrome.windows.onCreated.addListener(function (win) {
  var i = instances[win.id.toString()] = new ReloadPlugin(globalConfig);
  i.currentWindow = win.id;
});
chrome.windows.onRemoved.addListener(function (id) {
  instances[id.toString()].destroy();
  delete instances[id.toString()];
});
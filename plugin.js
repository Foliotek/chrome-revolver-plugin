var ReloadPlugin = function (settings) {
  var self = this;
  self.activeWindows = new Array();
  self.timeDelay = settings.seconds || 10;
  self.tabReload = settings.reload || true;
  self.tabInactive = settings.inactive || false;
  self.tabAutostart = settings.autostart || false;
  self.noRefreshList = settings.noRefreshList || [];
  self.currentWindow = settings.currentWindow;
  self.reloadTabIds = settings.reloadTabIds || [];

  chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (t) {
      self.currentTab = t.index;
      if (self.isGoing) {
        self.startTimer();
      }
    });
  });
};

ReloadPlugin.prototype.start = function () {
  var self = this;
  self.updateBadge('on');
  self.isGoing = true;
  self.getActiveTab(function (tab) {
    self.currentTab = tab.index;
    self.startTimer();
  });
};

ReloadPlugin.prototype.stop = function () {
  var self = this;
  self.isGoing = false;
  self.updateBadge('');
  clearTimeout(self.timer);
};

ReloadPlugin.prototype.updateBadge = function (status) {
  switch (status)
  {
    case 'on':
      chrome.browserAction.setBadgeText({text:"\u2022"});
      chrome.browserAction.setBadgeBackgroundColor({color:[0,255,0,100]});
      chrome.browserAction.setTitle({title: 'Revolver - Enabled'});
      break;
    case '':
      chrome.browserAction.setBadgeText({text:"\u00D7"});
      chrome.browserAction.setBadgeBackgroundColor({color:[255,0,0,100]});
      chrome.browserAction.setTitle({title: 'Revolver - Disabled'});
      break;
    default:
      chrome.browserAction.setBadgeText({text:""});
      chrome.browserAction.setTitle({title: 'Revolver - Not Started'});
  };
};

ReloadPlugin.prototype.startTimer = function () {
  var self = this;
  clearTimeout(self.timer);
  self.timer = setTimeout(function () {
    self.loadNextTab();
  }, self.timeDelay * 1000);
};

ReloadPlugin.prototype.getActiveTab = function (cb) {
  chrome.tabs.query({
    'active': true, 
    'windowId': self.currentWindow
  }, function (tab) {
    cb(tab[0]);
  });
};

ReloadPlugin.prototype.loadNextTab = function () {
  var self = this;
  self.currentTab += 1;
  chrome.tabs.query({ windowId: self.currentWindow }, function (tabs) {
    if (self.currentTab >= tabs.length) {
      self.currentTab = 0;
    }

    var nextTab = tabs.filter(function (t) {
      return t.index === self.currentTab;
    });

    if (nextTab.length > 0) {
      self.activateTab(nextTab[0]);
    }
  });
};

ReloadPlugin.prototype.shouldReloadTab = function (id) {
  var self = this;
  console.log("should reload", self.tabReload, self.reloadTabIds.length, self.reloadTabIds.indexOf(id), id);
  return (self.tabReload && self.reloadTabIds.length === 0)
        || (self.reloadTabIds.indexOf(id) > -1);
};

ReloadPlugin.prototype.activateTab = function (tab) {
  var self = this;
  function setTabActive () {
    chrome.tabs.update(tab.id, { active: true }, function () {
      self.startTimer();
    });
  }
  if (self.shouldReloadTab(tab.id)) {
    chrome.tabs.onUpdated.addListener(function tabLoadComplete (tabId, info, t) {
      if (info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(tabLoadComplete);
        setTabActive();
      }
    });
    chrome.tabs.reload(tab.id, {}, null);
  }
  else {
    setTabActive();
  }
};
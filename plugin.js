var ReloadPlugin = function (settings) {
  var self = this;
  self.update(settings);
  self.isGoing = false;

  chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (t) {
      self.currentTab = t;
      if (self.isGoing) {
        self.startTimer();
      }
    });
  });
};

ReloadPlugin.prototype.update = function (settings) {
  var self = this;
  self.timeDelay = settings.seconds || 10;
  self.tabReload = settings.reload || true;
  self.tabInactive = settings.inactive || false;
  self.tabAutostart = settings.autostart || false;
  self.noRefreshList = settings.noRefreshList || [];
  self.reloadTabIds = settings.reloadTabIds || [];
};

ReloadPlugin.prototype.start = function () {
  var self = this;
  self.isGoing = true;
  self.getActiveTab(function (tab) {
    self.currentTab = tab;
    self.startTimer();
  });
};

ReloadPlugin.prototype.stop = function () {
  var self = this;
  self.isGoing = false;
  clearTimeout(self.timer);
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
  var ix = self.currentTab.index + 1;

  chrome.tabs.query({ windowId: self.currentWindow }, function (tabs) {
    if (ix >= tabs.length) {
      ix = 0;
    }
    console.log(self.currentWindow, ix, tabs);

    var nextTab = tabs.filter(function (t) {
      return t.index === ix;
    });

    if (nextTab.length > 0) {
      self.activateTab(nextTab[0]);
    }
  });
};

ReloadPlugin.prototype.shouldReloadTab = function (id) {
  var self = this;
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

ReloadPlugin.prototype.destroy = function () {
  self.timer = null;
};
function updateCount(tabId, isOnRemoved) {
  browser.tabs.query({})
  .then((tabs) => {
    let length = tabs.length;

    // onRemoved fires too early and the count is one too many.
    // see https://bugzilla.mozilla.org/show_bug.cgi?id=1396758
    if (isOnRemoved && tabId && tabs.map((t) => { return t.id; }).includes(tabId)) {
      length--;
    }

    browser.browserAction.setBadgeText({text: length.toString()});
    if (length < 30) {
      browser.browserAction.setBadgeBackgroundColor({'color': '#479447'});
    }
    else if (length < 60) {
      browser.browserAction.setBadgeBackgroundColor({'color': '#ECB40E'});
    }
    else {
      browser.browserAction.setBadgeBackgroundColor({'color': '#D33B27'});
    }
  });
}


browser.tabs.onRemoved.addListener(
  (tabId) => { updateCount(tabId, true);
});
browser.tabs.onCreated.addListener(
  (tabId) => { updateCount(tabId, false);
});
updateCount();

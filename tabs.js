
/**
 * listTabs to switch to
 */
function listTabs() {
  getAllTabs().then((tabs) => {
    let tabsList = document.getElementById('tabs-list');
    let currentTabs = document.createDocumentFragment();
    let limit = 400;
    let counter = 0;

    tabsList.textContent = '';

    for (let tab of tabs) {
      if (counter <= limit) {
        let tabLink = document.createElement('a');

        tabLink.textContent = tab.title || tab.id;
        tabLink.setAttribute('href', tab.id);
        tabLink.classList.add('tab-link');
        tabLink.dataset.tab_url = tab.url;
        currentTabs.appendChild(tabLink);
      }

      counter += 1;
    }

    tabsList.appendChild(currentTabs);
  });
}

function initFilter() {

  var tabFilter = document.getElementById("tab-filter");

  tabFilter.onkeyup=function(e){

    var filterInput = document.getElementById("tab-filter"),
        matcher = new RegExp(filterInput.value, "gi"),
        tabLinks = document.getElementsByClassName("tab-link"),
        tabCount = tabLinks.length;

    // If the Enter key is pressed, select the tab at the top of the list
    if (e.which == 13) {
      for (var i=0; i<tabCount; i++) {

        var tabLink = tabLinks[i];
        if (tabLink.style.display == "block") {
          tabLink.click();
          return;
        }

      }
    }

    for (var i=0; i<tabCount; i++) {

      var tabLink = tabLinks[i];
      if (matcher.test(tabLink.innerHTML) || matcher.test(tabLink.dataset.tab_url)) {
        tabLink.style.display="block";
      }
      else {
        tabLink.style.display="none";
      }

    }
  }
}


document.addEventListener("DOMContentLoaded", listTabs);
document.addEventListener("DOMContentLoaded", initFilter);

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

function getAllTabs() {
  return browser.tabs.query({});
}

document.addEventListener("click", (e) => {
  function callOnActiveTab(callback) {
    getAllTabs().then((tabs) => {
      for (var tab of tabs) {
        if (tab.active) {
          callback(tab, tabs);
        }
      }
    });
}

  if (e.target.id === "tabs-alertinfo") {
    callOnActiveTab((tab) => {
      let props = "";
      for (let item in tab) {
        props += `${ item } = ${ tab[item] } \n`;
      }
      alert(props);
    });
  }

  else if (e.target.classList.contains('tab-link')) {

    var tabId = +e.target.getAttribute('href');

    getAllTabs().then((tabs) => {
      for (var tab of tabs) {
        if (tab.id === tabId) {
          browser.tabs.update(tabId, {
            active: true
          });
          browser.windows.update(tab.windowId, {
            focused: true
          });
        }
      }
    });
  }

  e.preventDefault();
});

//onRemoved listener. fired when tab is removed
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log(`The tab with id: ${tabId}, is closing`);

  if(removeInfo.isWindowClosing) {
    console.log(`Its window is also closing.`);
  } else {
    console.log(`Its window is not closing`);
  }
});

//onMoved listener. fired when tab is moved into the same window
browser.tabs.onMoved.addListener((tabId, moveInfo) => {
  var startIndex = moveInfo.fromIndex;
  var endIndex = moveInfo.toIndex;
  console.log(`Tab with id: ${tabId} moved from index: ${startIndex} to index: ${endIndex}`);
});

/*
 * Focus on the filter input, display a list of all tabs, and
 * initialize the live text filter and tab link selection.
 */
function init() {

  var tabFilter = document.getElementById("tab-filter");

  if (location.search != "?focusHack") location.search = "?focusHack";

  tabFilter.focus();
  setTimeout(function() { tabFilter.focus(); }, 100);


  // List all tabs
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
        tabLink.classList.add('tab-link', 'shown');
        tabLink.dataset.tab_url = tab.url;
        currentTabs.appendChild(tabLink);
      }

      counter += 1;
    }

    tabsList.appendChild(currentTabs);

    initFilter();

  });
}

/*
 * Intialize tab text filter and selection
 */
function initFilter() {

  var tabFilter = document.getElementById("tab-filter"),
      tabLinks = document.getElementsByClassName("tab-link"),
      tabCount = tabLinks.length,
      selectedTabLink = resetSelectedTabLink();

  tabFilter.onkeyup = function(e) {

    var matcher = new RegExp(tabFilter.value, "gi");

    switch(e.which) {

      // Enter: go to the selected tab
      case 13:
        if (document.getElementsByClassName("tab-link selected")[0]) {
          document.getElementsByClassName("tab-link selected")[0].click();
        }
        break;

      // Up arrow: Select the previous visible tab link
      case 38:
        if (previousAvailable(selectedTabLink)) {
          selectedTabLink.classList.remove('selected');
          selectedTabLink = previousAvailable(selectedTabLink);
          selectedTabLink.classList.add('selected');
        }
        break;

      // Down arrow: Select the next visible tab link
      case 40:
        if (nextAvailable(selectedTabLink)) {
          selectedTabLink.classList.remove('selected');
          selectedTabLink = nextAvailable(selectedTabLink);
          selectedTabLink.classList.add('selected');
        }
        break;

      // Filter the tabs
      default:
        for (var i=0; i<tabCount; i++) {
          var tabLink = tabLinks[i];
          if (matcher.test(tabLink.innerHTML) || matcher.test(tabLink.dataset.tab_url)) {
            tabLink.classList.add("shown");
            tabLink.classList.remove("hidden");
          }
          else {
            tabLink.classList.add("hidden");
            tabLink.classList.remove("shown");
          }
        }
        selectedTabLink = resetSelectedTabLink();
    }
  }

  // Initialize tab link hover selection
  for (var i=0; i<tabCount; i++) {
    var tabLink = tabLinks[i];
    tabLink.addEventListener('mouseenter', function(e) {
      if (document.getElementsByClassName("tab-link selected")[0]) {
        document.getElementsByClassName("tab-link selected")[0].classList.remove('selected');
      }
      e.target.classList.add('selected');
    });

    tabLink.addEventListener('mouseleave', function(e) {
      e.target.classList.remove('selected');
    });
  }
}

/*
 * Deselect any selected tab links, and select the first available one
 */
function resetSelectedTabLink() {
  var selectedTabLink = document.getElementsByClassName("tab-link selected");

  for (var i=0; i<selectedTabLink.length; i++) {
    selectedTabLink[i].classList.remove('selected');
  }

  selectedTabLink = document.getElementsByClassName("tab-link shown")[0];

  selectedTabLink.classList.add('selected');

  return selectedTabLink;
}

/*
 * Return the next sibling that's visible (available for selection)
 */
function nextAvailable(tabLink) {
  if (!tabLink) return false;

  var nextSib = tabLink.nextSibling;

  if (nextSib) {
    if (nextSib.classList.contains('shown')) return nextSib;
    else return nextAvailable(nextSib);
  }

  return false;
}

/*
 * Return the previous sibling that's visible (available for selection)
 */
function previousAvailable(tabLink) {
  if (!tabLink) return false;

  var prevSib = tabLink.previousSibling;

  if (prevSib) {
    if (prevSib.classList.contains('shown')) return prevSib;
    else return previousAvailable(prevSib);
  }

  return false;
}

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

function getAllTabs() {
  return browser.tabs.query({});
}

/*
 * Activate the selected tab and its parent window
 */
document.addEventListener("click", (e) => {

  if (e.target.classList.contains('tab-link')) {

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
          window.close();
        }
      }
    });
  }
  else document.getElementById("tab-filter").focus();

  e.preventDefault();
});

// Let's do this!
document.addEventListener("DOMContentLoaded", init);

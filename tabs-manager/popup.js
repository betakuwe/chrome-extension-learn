const tabs = await chrome.tabs.query({
  url: [
    "https://developer.chrome.com/docs/webstore/*",
    "https://developer.chrome.com/docs/extensions/*",
  ]
});

const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split("-")[0].trim();
  const pathname = new URL(tab.url).pathname.slice("/docs".length);

  element.querySelector(".title").textContent = title;
  element.querySelector(".pathname").textContent = pathname;
  element.querySelector("a").addEventListener("click", async () => {
    // need to focus window as well as the active tab
    chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector("ul").append(...elements);

let groupedTabs;

const button = document.querySelector("button");
button.addEventListener("click", () => {
  if (groupedTabs === undefined) {
    groupTabs();
  } else {
    ungroupTabs();
  }
});

function ungroupTabs() {
  for (const tabId of groupedTabs) {
    chrome.tabs.ungroup(tabId);
  }
  groupedTabs = undefined;
}

function groupTabs() {
  groupedTabs = tabs.map(({ id }) => id);
  if (groupedTabs.length) {
    chrome.tabs.group({ tabIds: groupedTabs })
      .then((group) => chrome.tabGroups.update(group, { title: "DOCS" }));
  } else {
    groupedTabs = undefined;
  }
}


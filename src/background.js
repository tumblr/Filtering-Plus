chrome.contextMenus.create({
  documentUrlPatterns: ['*://www.tumblr.com/*'],
  contexts: ['link'],
  id: 'tagFiltering',
  targetUrlPatterns: [
    '*://www.tumblr.com/tagged/*',
    '*://www.tumblr.com/blog/view/*/search/*',
    '*://www.tumblr.com/blog/view/*/tagged/*'
  ],
  title: 'Filter this tag'
});

chrome.contextMenus.create({
  documentUrlPatterns: ['*://www.tumblr.com/*'],
  contexts: ['selection'],
  id: 'contentFiltering',
  title: 'Filter the phrase: “%s”'
});

const getTag = linkUrl => {
  const { pathname } = new URL(linkUrl);
  const encodedTag = pathname.split('/').pop();
  const decodedTag = decodeURIComponent(encodedTag);
  return decodedTag;
};

const onMenuItemClicked = function ({ menuItemId, linkUrl, selectionText }, { id: tabId }) {
  const url = menuItemId === 'tagFiltering'
    ? '/v2/user/filtered_tags'
    : '/v2/user/filtered_content';

  const body = menuItemId === 'tagFiltering'
    ? { filtered_tags: [getTag(linkUrl)] }
    : { filtered_content: [selectionText] };

  const code = `{
    const { nonce } = [...document.scripts].find(script => script.getAttributeNames().includes('nonce'));
    const script = document.createElement('script');
    script.setAttribute('nonce', nonce);
    script.textContent = 'window.tumblr.apiFetch("${url}", { method: "POST", body: ${JSON.stringify(body)} })';

    document.documentElement.append(script);
    script.remove();
  }`;

  chrome.tabs.executeScript(tabId, { code });
};

chrome.contextMenus.onClicked.addListener(onMenuItemClicked);

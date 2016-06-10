function clickHandler(info, tab) {
  var selection = info.selectionText

  chrome.tabs.sendMessage(tab.id, {"selection": selection}, function(response) {
    // ask the content script what the slug is and commit hash...
    console.log(response);
    alert(response.repo_slug + " " + response.commit_hash);
  })

  // then send API request
  // then display a pop-up to the code.
}

chrome.contextMenus.create({
  "title": "Go to definition",
  "contexts": ["selection"],
  "onclick" : clickHandler
});
function clickHandler(info, tab) {
  var selection = info.selectionText;

  // ask the content script what the slug is and commit hash...
  sendMessage(tab.id, "tag_query", {}, function(response) {
    getDefinitions(selection, response.repoSlug, response.commitHash, function(err, definitions) {
      if (err) {
        return sendMessage(tab.id, 'error', {message: 'Could not get results'});
      }
      sendMessage(tab.id, 'definition_response', definitions);
    });
  });

  function sendMessage(tabID, messageType, message, callback) {
    defaults = { sender: "github-ctags-background-page" };
    payload = { messageType: messageType }
    payload = $.extend(payload, defaults);
    payload = $.extend(payload, message);
    chrome.tabs.sendMessage(tabID, payload, callback);
  }
}

chrome.contextMenus.create({
  "title": "Go to definition",
  "contexts": ["selection"],
  "onclick" : clickHandler
});

function getDefinitions(identifier, repoSlug, commitHash, callback) {
  $.ajax({
    url: "https://github-ctags.gordn.org/definition?repo_slug=" + repoSlug + "&commit=" + commitHash + "&tag=" + identifier
  })
  .done(function(response) {
    response = JSON.parse(response);

    // chrome.tabs.create({url: results[0].url + "#L" + results[0].line_number});
    callback(null, response);
  })
  .fail(function() { callback('failed'); })
};
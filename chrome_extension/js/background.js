function clickHandler(info, tab) {
  var selection = info.selectionText;

  // ask the content script what the slug is and commit hash...
  sendMessage(tab.id, "tag_query", {}, function(response) {
    getDefinitions(selection, response.repo_slug, response.commit_hash, function(err, definitions) {
      if (err) {
        return sendMessage(tab.id, 'error', {message: 'Could not get results'});
      }
      sendMessage(tab.id, 'definition_response', definitions);
    });
  });

  function sendMessage(tab_id, message_type, message, callback) {
    defaults = { sender: "github-ctags-background-page" };
    payload = { message_type: message_type }
    payload = $.extend(payload, defaults);
    payload = $.extend(payload, message);
    chrome.tabs.sendMessage(tab_id, payload, callback);
  }
}

chrome.contextMenus.create({
  "title": "Go to definition",
  "contexts": ["selection"],
  "onclick" : clickHandler
});

function getDefinitions(identifier, repo_slug, commit_hash, callback) {
  $.ajax({
    url: "http://github-ctags.gordn.org/definition?repo_slug=" + repo_slug + "&commit=" + commit_hash + "&tag=" + identifier
  })
  .done(function(response) {
    response = JSON.parse(response);

    // chrome.tabs.create({url: results[0].url + "#L" + results[0].line_number});
    callback(null, response);
  })
  .fail(function() { callback('failed'); })
};
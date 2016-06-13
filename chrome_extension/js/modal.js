'use strict';

var Modal = (function(){
  var MODAL_ID = 'gh-ctags-definitions-modal';

  var create = function(definitions, locationX, locationY) {
    var modal_holder = generateModal();
    var menu_list = modal_holder.find('.select-menu-list');

    definitions.map(function(definition) {
      return generateListItem(definition.url, definition.filename, definition.line_number);
    }).forEach(function(list_item) {
      menu_list.append(list_item);
    })

    // add modal to document and show it:
    modal_holder.appendTo('body');
    modal_holder.offset({top: locationY, left: locationX});
    modal_holder.css('position', 'absolute');
    modal_holder.show();
  };

  function generateListItem(url, filename, line_number){
    var list_item = $('<a/>', {class: 'select-menu-item js-navigation-item js-navigation-open', href: url + '#L' + line_number, target: 'blank', role: 'menuitem', tabindex: 0});
    var list_item_div = $('<div/>', {class: 'select-menu-item-text'});
    var url = $('<div/>', {class: 'css-truncate css-truncate-target'}).html(filename.slice(40));
    var line_number = $('<code/>', {class: 'right'}).html(':' + line_number);

    list_item_div.append(url);
    list_item_div.append(line_number);
    list_item.append(list_item_div);

    return list_item;
  }

  function generateModal() {
    var modal_holder = $('<div/>', {class: 'select-menu-modal-holder', id: MODAL_ID});
    var modal = $('<div/>', {class: 'select-menu-modal js-menu-content', 'aria-hidden': 'false'})

    modal_holder.append(modal);

    var menu_header = $('<div/>', {class: 'select-menu-header'});
    var menu_title = $('<span/>', {class: 'select-menu-title'}).html('Go to definition');

    menu_header.append(menu_title);

    modal.append(menu_header);

    var menu_list = $('<div/>', {class: 'select-menu-list js-navigation-container js-active-navigation-container', role: 'menu'});

    modal.append(menu_list);

    return modal_holder;
  };

  var destroyOnClick = function(selector) {
    $(selector).on('click', function() {
      $('#' + MODAL_ID).remove();
    });
  };

  return {
    create: create,
    destroyOnClick: destroyOnClick
  }
})();
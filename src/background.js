/*jslint plusplus: true, white: true, browser: true, regexp: true */
/*global PendingMessage, PendingMessageTracker, LookupCache, chrome */

// Controls the scripts in the background page

(function() {

    'use strict';

    var pendingMessages = new PendingMessageTracker(new LookupCache(1000));

    chrome.extension.onMessage.addListener(function(message, sender) {
        pendingMessages.addMessage(new PendingMessage(message, sender.tab.id));
    });

}());

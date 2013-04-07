/*jslint plusplus: true, white: true, browser: true */
/*global escape */

/**
 * Tracks messages waiting for lookup results
 */
var PendingMessageTracker;
(function() {

    'use strict';

    /**
     * Initialize an ajax request to perform a lookup
     *
     * @param {string}         pattern The pattern to be matched
     * @param {PendingMessage} message The message object
     */
    var initializeRequest = function(pattern, message) 
    {
        var xhr, self = this;

        if (this.patternMap[pattern] === undefined) {
            this.patternMap[pattern] = [];

            xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                var result = false;

                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        result = xhr.responseText;
                    }

                    self.postResult(pattern, result);
                }
            };
            xhr.open('GET', 'http://android-manual.herokuapp.com/' + escape(pattern) + '?mode=url', true);
            xhr.send(null);
        }

        this.patternMap[pattern].push(message);
    };

    /**
     * Constructor
     *
     * @param {LookupCache} cache Cache manager object
     */
    PendingMessageTracker = function(cache)
    {
        this.cache = cache;

        this.patternMap = {};
    };

    /**
     * @var {object} Map of patterns lookups in progress
     */
    PendingMessageTracker.prototype.patternMap = null;

    /**
     * Add a message to the tracker
     *
     * @param {PendingMessage} message The message object
     */
    PendingMessageTracker.prototype.addMessage = function(message)
    {
        var i, l;

        for (i = 0, l = message.patterns.length; i < l; i++) {
            if (this.cache.hasItem(message.patterns[i])) {
                message.postResult(message.patterns[i], this.cache.getItem(message.patterns[i]));
            } else {
                initializeRequest.call(this, message.patterns[i], message);
            }
        }
    };

    /**
     * Post a lookup result to objects waiting
     *
     * @param {string}         search   The pattern being for which the result is being posted
     * @param {string|boolean} quickRef The lookup result
     */
    PendingMessageTracker.prototype.postResult = function(search, quickRef)
    {
        var i, l;

        if (this.patternMap[search] !== undefined) {
            this.cache.setItem(search, quickRef);

            for (i = 0, l = this.patternMap[search].length; i < l; i++) {
                this.patternMap[search][i].postResult(search, quickRef);
            }

            delete this.patternMap[search];
        }
    };

}());

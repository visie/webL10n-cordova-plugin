/**
 * Copyright (c) 2015 Matthew Rayner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/*jshint browser: true, devel: true, es5: true, globalstrict: true */
'use strict';

var HTML10n_plugin = function() {};
window.HTML10n_plugin = HTML10n_plugin;

HTML10n_plugin.prototype.default_locale = "uk";
HTML10n_plugin.prototype.persistant = true;

/**
 * Initialize our plugin
 *
 * @param default_locale
 * @param persistant
 * @returns {HTML10n_plugin}
 */
HTML10n_plugin.prototype.initialize = function(default_locale, persistant) {
    var self = this;

    if (typeof default_locale != 'undefined') {
        self.default_locale = default_locale;
    }

    if (typeof persistant != 'undefined') {
        self.persistant = persistant;
    }

    console.log('HTML10n - Initializing with default_locale: ' + self.default_locale);

    self.inject_tags();

    self.initialize_l10n();

    return this;
};

/**
 * Create the default link tag and script tags into the document HEAD
 *
 * @returns {HTML10n_plugin}
 */
HTML10n_plugin.prototype.inject_tags = function() {
    var head = document.getElementsByTagName('head')[0];
    document.documentElement.lang = this.locale(); // What locale should webL10n load?

    var localization_tag = document.createElement('link');
    localization_tag.rel =  'prefetch';
    localization_tag.href = 'lang/data.ini';
    localization_tag.type = 'application/l10n';

    var script_tag = document.createElement('script');
    script_tag.type = 'text/javascript';
    script_tag.src =  'js/thirdparty/l10n.js';

    console.log('HTML10n - Injecting header tags');

    head.appendChild(localization_tag);
    head.appendChild(script_tag);

    return this;
};

/**
 * Initialize the html10n library that drives our plugin.
 */
HTML10n_plugin.prototype.initialize_l10n = function() {
    var self = this;

    if(typeof document.webL10n == 'undefined'){
        console.log('HTML10n - Waiting for webL10n...');

        setTimeout(function() {
            self.initialize_l10n();
        }, 100);
    } else {
        console.log('HTML10n - Setting language to: '+self.locale());

        var saved_data, saved_lang, saved_version;

        if(self.persistant) {
            console.log('HTML10n - PERSISTANT - Setting listener to save language data');

            window.addEventListener('localized', function() {
                if(self.locale() == document.webL10n.getLanguage()){
                    console.log('HTML10n - Loaded expected Language - Saving');

                    cordova.getAppVersion.getVersionNumber().then(function (version) {
                        console.log('Saving Translation Data For App Version: '+version);

                        localStorage.setItem('translation_data', JSON.stringify(document.webL10n.getData()));
                        localStorage.setItem('translation_lang', document.webL10n.getLanguage());
                        localStorage.setItem('app_version', version);
                    });
                } else {
                    console.log('HTML10n - Loaded unexpected language - NOT SAVING');
                }
            }, false);

            // Have we already loaded the translation data?
            saved_data = localStorage.getItem('translation_data');
            saved_lang = localStorage.getItem('translation_lang');
            saved_version = localStorage.getItem('app_version');
        }

        cordova.getAppVersion.getVersionNumber().then(function (version) {
            if(self.persistant && self.locale() == saved_lang && saved_data && version == saved_version) {
                console.log('HTML10n - Translating from saved data');

                document.webL10n.setLanguageWithData(self.locale(), JSON.parse(saved_data));
            } else {
                document.webL10n.setLanguage(self.locale());
            }
        });
    }

    return self;
};

HTML10n_plugin.prototype.locale = function() {
    return this.default_locale;
};

module.exports = new HTML10n_plugin();
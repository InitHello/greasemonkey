// ==UserScript==
// @name         Kitcheat
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       InitHello
// @match        http://bloodrizer.ru/games/kittens/
// @require      https://code.jquery.com/jquery-3.3.1.min.js#sha256=FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    class Cheat {
        constructor() {
            this.log = {
                debug: (msg) => {
                    if (this.config.logLevel >= 1) {
                        console.log(`ERROR: ${msg}`);
                    }
                },
                debug: (msg) => {
                    if (this.config.logLevel >= 2) {
                        console.log(`DEBUG: ${msg}`);
                    }
                },
                info: (msg) => {
                    if (this.config.logLevel >= 3) {
                        console.log(`INFO: ${msg}`);
                    }
                }
            }
            this.config.logLevel = 1;
            this.resources = {};
            this.loadConfig();
            // this.getResources(game);
        }
        loadConfig() {
            if (localStorage.getItem('kitCheat') !== null) {
                this.config = JSON.parse(localStorage.getItem('kitCheat'));
            }
            else {
                this.config = {hunters: {enabled: false, class: 'chtoff'},
                               astro: {enabled: false, class: 'chtoff'},
                               log: {enabled: false, class: 'chtoff'}};
                this.saveConfig();
            }
        }
        saveConfig() {
            localStorage.removeItem('kitCheat');
            this.config.logLevel = 1;
            localStorage.setItem('kitCheat', JSON.stringify(this.config));
        }
        getResources(game) {
            var resourcehash;
            var resources = game.resPool.resources;
            for (var resourceid in resources) {
                var resource = game.resPool.resources[resourceid];
                name = resource.name;
                this.resources[name] = resource;
            }
        }
        getCraftLinks() {
            rootnode = $('#leftColumnViewport').firstChild();
        }
        findRow(resource) {
            var craftTable = $('#fastPraiseContainer').next().find('.res-row.craft');
            for (var i = 0; i <= craftTable.length; i++) {
                var row = $(craftTable[i]).children();
                var resname = row[0].lastChild.data;
                var resvalue = row[1];
                var craftone = row[2].lastChild;
                var craftsome = row[3].lastChild;
                var craftmany = row[4].lastChild;
                var craftall = row[5].lastChild;
                if (resname == resource) {
                    return {one: craftone, some: craftsome, many: craftmany, all: craftall}
                }
            }
        }
    }
    // Your code here...
    var daddy = $('#topBar');
    var child = $('#kitCheat');
    if (!child.length) {
        var cheat = new Cheat();
        var css = $(['<style type="text/css">#kitCheat { z-index: 99999; position: fixed; top: 7px; left: 180px; } a.chtoff { color: red; } ',
                     'a.chton { color: green; } a.cheats { border: 1px solid black; margin: 3px; }</style>'].join(''));
        var elm = $(['<div id="kitCheat">',
                     `<a href="#" id="toggleHunters" data-item="hunters" class="cheats ${cheat.config.hunters.class} hunters">Hunters</a>`,
                     `<a href="#" id="toggleAstro" data-item="astro" class="cheats ${cheat.config.astro.class} astro">Astronomers</a>`,
                     `<a href="#" id="toggleLog" data-item="log" class="cheats ${cheat.config.log.class} log">Log</a>`,
                     '</div>'].join(''));
        $(document.body).append(css);
        daddy.append(elm);
        $('.cheats').on('click', (ev) => {
            var elm = $(ev.currentTarget);
            var item = elm.attr('data-item');
            var cont = $('#kitCheat');
            var isactive = cheat.config[item].enabled;
            if (isactive) {
                cheat.config[item].enabled = false;
                cheat.config[item].class = 'chtoff';
                cheat.saveConfig();
                elm.removeClass('chton')
                elm.addClass('chtoff')
            }
            else {
                cheat.config[item].enabled = true;
                cheat.config[item].class = 'chton';
                cheat.saveConfig();
                elm.removeClass('chtoff')
                elm.addClass('chton')

            }
        });
    }

    function craft(number, item) {
        var craftbuttons = cheat.findRow(item);
        craftbuttons[number].click();
    }

    function overThreshold(resource, threshold) {
        var adj = cheat.resources[resource].maxValue * threshold;
        if (cheat.resources[resource].maxValue == 0) {
            return false;
        }
        if (cheat.resources[resource].value >= adj) {
            return true;
        }
        return false
    }

    function checkResources() {
        craft('all', 'parchment');
        if (overThreshold('catnip', 0.8)) {
            cheat.log.debug('Crafting wood.');
            craft('many', 'wood');
        }
        if (overThreshold('wood', 0.8)) {
            cheat.log.debug('Crafting beams.');
            craft('many', 'beam');
        }
        if (overThreshold('minerals', 0.8)) {
            cheat.log.debug('Crafting slabs.');
            craft('many', 'slab');
        }
        if (overThreshold('iron', 0.8) || overThreshold('coal', 0.8)) {
            cheat.log.debug('Burning iron and coal.');
            craft('all', 'steel');
            craft('all', 'plate');
        }
        if (overThreshold('culture', 0.75)) {
            cheat.log.debug('Kittens are too cultured, extracting yoghurt.');
            craft('one', 'manuscript');
        }
        if (overThreshold('science', 0.75)) {
            cheat.log.debug('Kittens are too scientific, extracting brain juice.');
            craft('one', 'compendium');
            craft('one', 'blueprint');
        }
        if (overThreshold('faith', 0.90)) {
            $('#fastPraiseContainer:first-child').click();
        }
    }

    function kitcheat() {
        cheat.getResources(game);
        var craftbuttons = cheat.findRow('wood');
        var controller = $('#kitCheat');
        var hunters = cheat.config.hunters.enabled;
        var astro = cheat.config.astro.enabled;
        var log = cheat.config.log.enabled;
        checkResources();
        if (hunters) {
            var huntbtn = $('#fastHuntContainerCount');
            if (huntbtn.length > 0) {
                huntbtn.click();
            }
        }
        if (astro) {
            var astrobtn = $('#observeBtn');
            if (astrobtn.length > 0) {
                astrobtn.click();
            }
        }
        if (log) {
            $('#clearLogHref').click();
        }
        window.setTimeout(kitcheat, 2000);
    }

    window.setTimeout(kitcheat, 2000);
})();

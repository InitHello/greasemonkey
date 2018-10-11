// ==UserScript==
// @name         Kitcheat
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       InitHello
// @match        http://bloodrizer.ru/games/kittens/
// @require      https://code.jquery.com/jquery-3.3.1.min.js#sha256=FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @grant        none
// ==/UserScript==


$(function() {
    'use strict';

    class Cheat {
        constructor() {
            this.log = {
                error: (msg) => {
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
            this.resources = {};
            this.capless_resources = ['hunters', 'astronomers', 'log']
            this.managed_resources = ['science', 'culture', 'catnip', 'wood', 'minerals', 'coal', 'iron'];
            this.loadConfig();
        }
        loadConfig() {
            if (localStorage.getItem('kitCheat') !== null) {
                this.config = JSON.parse(localStorage.getItem('kitCheat'));
            }
            else {
                this.config = {logLevel: 0, resource_management: {}};
                for (var resource in this.capless_resources) {
                    this.config.resource_management[this.capless_resources[resource]] = {manage: false};
                }
                for (var resource in this.managed_resources) {
                    this.config.resource_management[this.managed_resources[resource]] = {manage: false, threshold: 80};
                }
                this.saveConfig();
            }
            this.log.debug({config: this.config});
        }
        saveConfig() {
            localStorage.removeItem('kitCheat');
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
        getCraftTables() {
            var craftTable = $('#fastPraiseContainer').next().find('.res-row.craft');
            var craftTables = {};
            for (var idx = 0; idx <= craftTable.length; idx++) {
                var line = craftTable[idx];
                var craftlinks = $(line).find('.res-cell.craft-link');
                var resname = $($(line).children()[0]).text();
                if (resname == '') {
                    continue;
                }
                if (craftlinks.length != 4) {
                    continue;
                }
                var craft_selectors = {one: craftlinks[0], some: craftlinks[1], many: craftlinks[2], all: craftlinks[3]};
                craftTables[resname] = craft_selectors;
            }
            return craftTables;
        }
        findRow(resource) {
            if (this.craftTables.hasOwnProperty(resource)) {
                return this.craftTables[resource];
            }
        }
    }

    function showCheats() {
        var cheat_contents = ['<div class="bldGroupContainer">'];
        for (var idx in cheat.capless_resources) {
            var resource = cheat.capless_resources[idx];
            if (cheat.config.resource_management.hasOwnProperty(resource)) {
                var enabled = cheat.config.resource_management[resource].manage ? 'on' : 'off';
                var chtclass = cheat.config.resource_management[resource].manage ? ' bldEnabled' : '';
                var label = resource[0].toUpperCase() + resource.slice(1);
                cheat_contents = cheat_contents.concat([
                         `<div id="cht-${resource}" class="btn nosel modern${chtclass}" style="position: relative; display: block; margin-left: auto; margin-right: auto;">`,
                         '<div class="btnContent" title="">',
                         `<span>${label}</span>`,
                         '<span class="linkBreak" style="float: right; padding-left: 2px; margin-right: 1px;">|</span>',
                         `<a href="#" class="cheats" data-item="${resource}" style="" title="Active">${enabled}</a>`,
                         '<span class="linkBreak" style="float: right; padding-left: 2px;">|</span>',
                         '</div></div>']);
            }
        }
        for (var idx in cheat.managed_resources) {
            var resource = cheat.managed_resources[idx];
            if (cheat.config.resource_management.hasOwnProperty(resource)) {
                var enabled = cheat.config.resource_management[resource].manage ? 'on' : 'off';
                var chtclass = cheat.config.resource_management[resource].manage ? ' bldEnabled' : '';
                var label = resource[0].toUpperCase() + resource.slice(1);
                var cap = cheat.config.resource_management[resource].threshold;
                cheat_contents = cheat_contents.concat([
                         `<div id="cht-${resource}" class="btn nosel modern${chtclass}" style="position: relative; display: block; margin-left: auto; margin-right: auto;">`,
                         '<div class="btnContent" title="">',
                         `<span>${label}</span>`,
                         '<span class="linkBreak" style="float: right; padding-left: 2px; margin-right: 1px;">|</span>',
                         `<div style="float: right;"><input type="text" id="cap_${resource}" class="resourcecap" data-resource="${resource}" value="${cap}" /></div>`,
                         '<span class="linkBreak" style="float: right; padding-left: 2px; margin-right: 1px;">|</span>',
                         `<a href="#" class="cheats" data-item="${resource}" style="" title="Active">${enabled}</a>`,
                         '<span class="linkBreak" style="float: right; padding-left: 2px;">|</span>',
                         '</div></div>']);
            }
        }
        cheat_contents.push('</div>');
        var elm = $(cheat_contents.join(''));
        var tabContents = $('#gameContainerId').find('div.tabInner');
        tabContents.html(elm);
        $('.cheats').on('click', (ev) => {
            var elm = $(ev.currentTarget);
            var item = elm.attr('data-item');
            var isactive = cheat.config.resource_management[item];
            if (isactive.manage) {
                $('#cht-' + item).removeClass('bldEnabled');
                isactive.manage = false;
                cheat.config.resource_management[item] = isactive;
                cheat.saveConfig();
                elm.html('off')
            }
            else {
                $('#cht-' + item).addClass('bldEnabled');
                isactive.manage = true;
                cheat.config.resource_management[item] = isactive;
                cheat.saveConfig();
                elm.html('on')
            }
        });
    }

    function craft(number, item) {
        var craftTables = cheat.getCraftTables();
        if (craftTables.hasOwnProperty(item)) {
            $(craftTables[item][number]).click();
        }
    }

    function overThreshold(resource) {
        cheat.getResources(game);
        if (!cheat.config.resource_management.hasOwnProperty(resource)) {
            cheat.config.resource_management[resource] = {manage: false, threshold: 80};
            cheat.saveConfig();
        }
        if (!cheat.config.resource_management[resource].manage) {
            return false;
        }
        var management = cheat.config.resource_management[resource];
        var adj = cheat.resources[resource].maxValue * (management.threshold / 100);
        if (cheat.resources[resource].maxValue == 0) {
            return false;
        }
        if (cheat.resources[resource].value >= adj) {
            return true;
        }
        return false
    }

    function checkResources() {
        var many = ['catnip', 'wood', 'minerals']
        var mappings = {catnip: {wood: 'many'},
                        wood: {beam: 'many'},
                        minerals: {slab: 'many'},
                        iron: {steel: 'all', plate: 'all'},
                        coal: {steel: 'all'},
                        culture: {manuscript: 'one'},
                        science: {compendium: 'one', blueprint: 'one'},
                        furs: {parchment: 'all'}};
        for (var resource in mappings) {
            var over = overThreshold(resource);
            if (over) {
                for (var product in mappings[resource]) {
                    craft(mappings[resource][product], product);
                }
            }
        }
        if (overThreshold('faith')) {
            $('#fastPraiseContainer:first-child').click();
        }
    }

    var cheat = new Cheat();

    function initPage(cheat, game) {
            var tab = ['<span> | </span>',
                       '<a href="#" id="kitCheats" class="tab" style="white-space: nowrap;">Cheats</a>'].join('');
            var tabRow = $('#gameContainerId').find('div.tabsContainer');
            tabRow.append($(tab));
            $('#kitCheats').on('click', () => {
                showCheats();
            });
            var css = $(['<style type="text/css">',
                         '#kitCheat { z-index: 99999; position: fixed; top: 7px; left: 180px; }',
                         '#custom-handle { ',
                         'width: 3em; ',
                         'height: 1.6em; ',
                         'top: 50%; ',
                         'margin-top: -.8em; ',
                         'text-align: center; ',
                         'line-height: 1.6em; ',
                         '}',
                         '.resourcecap { width: 2em;',
                         'height: 12px; ',
                         'border: none; ',
                         '}',
                         '.cheatcap {',
                         'width: 36px;',
                         '}',
                         '.cheats { padding-left: 2px; float: right; cursor: pointer; }',
                         '</style>'].join(''));
            $(document.body).append(css);
    }

    function kitcheat() {
        cheat.getResources(game);
        var child = $('#kitCheats');
        if (!child.length) {
            initPage(cheat, game);
            cheat.craftTables = cheat.getCraftTables();
        }
        var craftbuttons = cheat.findRow('wood');
        var controller = $('#kitCheat');
        var hunters = cheat.config.resource_management.hunters.manage;
        var astro = cheat.config.resource_management.astronomers.manage;
        var log = cheat.config.resource_management.log.manage;
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
        window.setTimeout(kitcheat, 250);
    }

    window.setTimeout(kitcheat, 250);
});

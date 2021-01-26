"use strict";

import Glyph from '../../../common/glyph.js';
import { Color } from '../display.js';
import { game } from '../game.js';
import { getHandler, isReturnKey } from '../keys.js';
// import  LoseScreen  from './lose.js';
// import { pickupScreen } from './item-list.js';
// import { lookScreen } from './target.js';


class PlayScreen {
    constructor() {
        this.gameEnded = false;
        this.subScreen = null;
        this.screenWidth = null;
        this.screenHeight = null;
        this.map = null;
        this.player = null;
    }

    enter() {
        console.log("Entering play screen.");
        this.screenWidth = game.getScreenWidth();
        this.screenHeight = game.getScreenHeight();
        this.map = game.getMap();
        this.player = game.getEntity();
        this.player.pos = game.getEntrance();
        console.log("Entered play screen at ",this.player.pos);
    }

    exit() { 
        console.log("Exited play screen.");
    }

    render(display) {
        if (this.subScreen) {
            this.subScreen.render(display);
            return;
        }
        this.renderTiles(display);
        this.renderMessages();
        this.renderStats();
    }

    getScreenOffsets() {
        let topLeftX = Math.max(0, this.player.pos.x - (this.screenWidth / 2));
        topLeftX = Math.min(topLeftX, Math.max(0, this.map.getWidth() - this.screenWidth));
        let topLeftY = Math.max(0, this.player.pos.y - (this.screenHeight / 2));
        topLeftY = Math.min(topLeftY, Math.max(0, this.map.getHeight() - this.screenHeight));
        return {
            x: topLeftX,
            y: topLeftY
        };
    }

    renderTiles(display) {
        let visibleCells = {};
        let level = this.player.pos.z;
        // let viewDist = this.player.getSightRadius();
        let viewDist = 10;
        let map = this.map;
        let fov = map.getFov(level);
        fov.compute(
            this.player.pos.x, this.player.pos.y, viewDist, 
            function(x, y, radius, visibility) {
                let dist = (viewDist - radius)/viewDist;
                visibleCells[x + "," + y] = visibility * dist;
                map.setExplored(x, y, level, true);
            });
        this.renderMap(display, map, visibleCells, level);
    }

    renderMap(display, map, visibleCells, z) {
        let topLeft = this.getScreenOffsets();
        for (let x = topLeft.x; x < topLeft.x + this.screenWidth; x++) {
            for (let y = topLeft.y; y < topLeft.y + this.screenHeight; y++) {
                if (map.isExplored(x, y, z)) {
                    let glyph = this.getColouredGlyph(map, visibleCells, x, y, z);
                    display.draw(x - topLeft.x,
                                 y - topLeft.y, 
                                 glyph.getChar(), glyph.getForeground(), glyph.getBackground());
                }
            }
        }
    }

   getColouredGlyph(map, visibleCells, x, y, z) {
        let glyph = map.getTile(x, y, z);
        let foreground = Color.fromString('#211');
        let visibility = visibleCells[x + ',' + y];
        if (visibility) {
            let items = game.getItemsAt(x, y, z);
            if (items) {
                glyph = items.slice(-1)[0];
            }
            if (game.getEntityAt(x, y, z)) {
                glyph = game.getEntityAt(x, y, z);
            }

            let itemColour = Color.fromString(glyph.getForeground());
            foreground = Color.interpolate(foreground, itemColour, visibility);
        }
        return new Glyph({"char": glyph.getChar(), "foreground":Color.toRGB(foreground),"background":glyph.getBackground()});
    }

    renderMessages() {
        let messages = game.getMessages();
        for (let i = 0; i < messages.length; i++) {
            game.updateMessages(messages[i]);
        }
        game.clearMessages();
    }

    renderStats() {
        let lvl = 1;
        let statsHTML = `Lvl: ${lvl}`; 
        game.updateStats(statsHTML);
    }

    handleInput(inputType, inputData) {
        if (this.gameEnded) {
            if (isReturnKey(inputData)) {
                game.switchScreen(new LoseScreen());
            }
            return;
        }

        if (this.subScreen) {
            this.subScreen.handleInput(inputType, inputData);
            return;
        }
        
        let handler = getHandler(inputType, inputData);
        if (handler) {
            handler.func.call(this,inputData);
        }
    }

    move(direction) {
        game.move(direction);
    }

    gameOver() {
        this.gameEnded = true;
    }

    setSubScreen(subScreen) {
        this.subScreen = subScreen;
        game.refresh();
    }
};

export const playScreen = new PlayScreen();

"use strict";

import Glyph from './glyph.js';

export default class Tile extends Glyph {
    constructor(properties = {}) {
        super(properties);
        this.walkable = properties['walkable'] || false;
        this.blocksLight = (properties['blocksLight'] !== undefined) ?
            properties['blocksLight'] : true;
        this.description = properties['description'] || '(unknown)';
    }
    
    isWalkable() {
        return this.walkable;
    }

    isBlockingLight() {
        return this.blocksLight;
    }

    getDescription() {
        return this.description;
    }
};
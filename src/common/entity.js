"use strict";

import Item from './item.js';


export default class Entity extends Item {
    constructor(properties = {}) {
        super(properties);
        this.id = properties['id'];
        this.alive = (properties['alive'] !== undefined) ? properties['alive'] : true;
        this.name = properties['name'] || "anonymous";
        this.role = properties['role'] || "unknown";
        this.type = properties['type'];
        if (this.getChar() === ' ') { 
            this.setGlyph({'char':"?"});
        }
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.role;
    }

    isAlive() {
        return this.alive;
    }

    kill() {
        this.alive = false;
    }
}
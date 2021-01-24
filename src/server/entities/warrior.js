"use strict";

import ServerEntity from './server-entity.js';

export default class Warrior extends ServerEntity {
    constructor(properties) {
        super(properties);
        this.details = "a brawny warrior";
        this.setGlyph({'char':"@",'foreground':'yellow','background':"black"});
    }

}
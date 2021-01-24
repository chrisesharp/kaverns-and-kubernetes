"use strict";

import Entity from '../../common/entity.js';
// import { MSGTYPE, Messages } from '../messages.js';

const hungerLevels = {
    0: "not hungry",
    1: "hungry",
    2: "starving"
};

export default class ServerEntity extends Entity {
    constructor(properties) {
        super(properties);
        this.id = properties['id'];
    }

    handleCollision(other) {
        // if (other instanceof Array) {
        //     let msg = (other.length === 1) ? Messages.SINGLE_ITEM(other[0]) : Messages.MULTIPLE_ITEMS();
        //     this.messenger(this, MSGTYPE.INF, msg);
        // } else if (other.isAlive()) {
        //     if (this.isWielding()) {
        //         this.attack(other);
        //     } else {
        //         this.messenger(this, MSGTYPE.INF, Messages.ENTITY_THERE(other));
        //     }
        // } else {
        //     this.messenger(this, MSGTYPE.INF, Messages.ENTITY_DEAD(other));
        // }
    }

    getPos() {
        return {id:this.id, pos:this.pos};
    }
}
"use strict";

import { EVENTS } from "../common/events.js";
import State from "./state.js";
import Cave from "./cave.js";
import EntityFactory from "./entity-factory.js";

export default class EntityServer {
    constructor(backend, template) {
        this.template = template;
        this.messaging = backend;
        this.cave = new Cave(template);
        this.repo = new EntityFactory();
        this.reset();
    }

    createEntity(id, prototype) {
        if (prototype.pos) {
            prototype.pos = JSON.parse(prototype.pos);
            if (prototype.pos.x == undefined || prototype.pos.y == undefined)  {
                prototype.pos = this.cave.getEntrance(prototype.pos.z);
            }
        } else {
            prototype.pos = this.cave.getEntrance();
        }
        return this.entities.addEntity(id, prototype);
    }

    deleteEntity(entity) {
        if (this.entities.getEntity(entity.id)) {
           this.entities.removeEntity(entity);
        }
    }

    getEntities() {
        return this.entities.getEntities();
    }

    getItemsForRoom(pos) {
        return this.cave.getItems(this.getRoom(pos));
    }

    getRoom(pos) {
        return this.cave.getRegion(pos);
    }

    getMap(entity) {
        let map = this.cave.getMap();
        map.entrance = entity.entrance;
        return map;
    }

    sendMessage(entity, ...message) {
        let type = message.shift();
        this.messaging.sendMessageToEntity(entity, EVENTS.message, message);
        if (type === MSGTYPE.UPD) {
            let cmd = (entity.isAlive()) ? EVENTS.update : EVENTS.dead;
            this.messaging.sendMessageToEntity(entity, cmd, entity);
            if (cmd === EVENTS.dead) {
                this.deleteEntity(entity);
            }
        }
    }

    reset(properties) {
        this.entities = new State(this.repo);
    }
}
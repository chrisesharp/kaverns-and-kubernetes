"use strict";

import { EVENTS } from "../common/events.js";
import { getMovement } from "../common/movement.js";
import { MSGTYPE, Messages } from "./messages.js";
import State from "./state.js";
import Cave from "./cave.js";
import EntityFactory from "./entity-factory.js";
import { Tiles } from "./server-tiles.js";

export default class EntityServer {
    constructor(backend, template) {
        this.template = template;
        this.messaging = backend;
        this.cave = new Cave(template);
        this.repo = new EntityFactory(this);
        this.entities = new State(this.repo);
        this.connectGateways();
    }

    connectGateways(urls) {
        urls = urls || [];
        let index = 0;
        if (urls.length > 0) {
            let gatesByLevel = this.cave.getGatewayPositions();
            Object.keys(gatesByLevel).forEach((key) => {
                gatesByLevel[key].forEach((pos) => {
                    let url = urls[index];
                    this.cave.addGateway({pos:pos, url:url})
                    index = (index + 1) % urls.length;
                });
            });
        }
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
            this.messaging.sendToAll(EVENTS.delete, entity.pos);
            this.messaging.sendToAll(EVENTS.message, Messages.LEFT_DUNGEON(entity.describeA()));
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

    moveEntity(entity, direction) {
        let delta = getMovement(direction);
        let position = (entity.isAlive()) ? this.tryMove(entity, delta) : null;
        if (position) {
            entity.pos = position;
            this.messaging.sendToAll(EVENTS.position, entity.getPos());
        }
        return position;
    }

    tryMove(entity, delta) {
        let x = entity.pos.x + delta.x;
        let y = entity.pos.y + delta.y;
        let z = entity.pos.z + delta.z;
        let newPos = {x:x, y:y, z:z};
        let tile = this.cave.getMap().getTile(x, y, entity.pos.z);

        let target = this.entities.getEntityAt(newPos);
        if (target) {
            entity.handleCollision(target);
            return null;
        }
        
        if (tile.isWalkable()) {
            if (z !== entity.pos.z) {
                return this.levelChange(entity, newPos, tile);
            }

            if (tile.isGateway()) {
                return this.passGateway(entity, newPos);
            }

            let items = this.cave.getItemsAt(newPos);
            if (items.length > 0) {
                entity.handleCollision(items);
            }
            return newPos;
        }
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_WALK(entity));
        return null;
    }

    passGateway(entity, pos) {
        let gw = this.cave.getGateway(pos);
        if (gw) {
            this.sendMessage(entity, MSGTYPE.UPD, Messages.TELEPORT());
            this.messaging.sendMessageToEntity(entity, EVENTS.reconnect, {url:gw.url});
            this.deleteEntity(entity);
        }
    }

    levelChange(entity, newPos, tile) {
        if (newPos.z < entity.pos.z && tile === Tiles.stairsUpTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.ASCEND([newPos.z]));
            return newPos;
        }

        if (newPos.z > entity.pos.z && tile === Tiles.stairsDownTile) {
            this.sendMessage(entity, MSGTYPE.INF, Messages.DESCEND([newPos.z]));
            return newPos;
        } 
        
        this.sendMessage(entity, MSGTYPE.INF, Messages.NO_CLIMB(entity));
        return null;
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
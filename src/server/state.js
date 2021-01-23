"use strict";

import _ from "underscore";

export default class State {
    constructor(factory) {
        this.factory = factory;
        this.connections = {};
    }

    addEntity(id, prototype) {
        prototype.id = id;
        let entity = this.factory.create(prototype);
        entity.entrance = prototype.pos;
        this.connections[id] = entity;
        return entity;
    }

    getEntities() {
        return Object.keys(this.connections).map((v) => { return this.connections[v]; });
    }

    getEntity(id) {
        return this.connections[id];
    }

    getEntityAt(pos) {
        for (let socket_id in this.connections) {
            let entity = this.connections[socket_id];
            if (_.isEqual(entity.pos, pos)) {
                return entity;
            }
        }
    }

    removeEntityByID(id) {
        delete this.connections[id];
    }

    removeEntity(entity) {
        this.removeEntityByID(entity.id);
    }
}
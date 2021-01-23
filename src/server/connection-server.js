"use strict";

import { Server } from "socket.io";
import EntityServer from "./entity-server.js";
import { EVENTS } from "../common/events.js";
import { Messages } from "./messages.js";

export default class ConnectionServer {
    constructor(http, template) {
        this.template = template;
        this.open = true;
        this.backend = new Server(http);
        this.backend.on("connection", (socket) => { this.connection(socket); });
        this.messaging = null;
        // this.messaging = new Messaging(this.backend);
        this.entityServer = new EntityServer(this.messaging, template);
    }

    connection(socket) {
        if (this.open) {
            let prototype = socket.handshake.auth;
            if (!prototype.role) {
                socket.emit(EVENTS.missingRole);
            } else {
                this.enter(this.entityServer, socket, prototype);
            }
        }
    }

    enter(server, socket, prototype) {
        let entity = server.createEntity(socket.id, prototype);
        this.registerEventHandlers(socket, entity, server);
        // this.messaging.sendToAll(EVENTS.entities, server.getEntities());
        this.enterRoom(socket, entity, server.getRoom(entity.pos));
        return entity;
    }

    enterRoom(socket, entity, room) {
        socket.join(room);
        socket.broadcast.to(room).emit(EVENTS.message, Messages.ENTER_ROOM(entity.describeA()));
        socket.emit(EVENTS.items, this.entityServer.getItemsForRoom(entity.pos));
    }

    stop() {
        // this.messaging.stop();
        this.backend.close();
        this.open = false;
    }

    registerEventHandlers(socket, entity, server) {
        socket.on(EVENTS.getEntities, () => {
            socket.emit(EVENTS.entities, server.getEntities());
        });

        socket.on(EVENTS.getItems, () => {
            socket.emit(EVENTS.items, server.getItemsForRoom(entity.pos));
        });

        socket.on(EVENTS.getMap, () => {
            socket.emit(EVENTS.map, server.getMap(entity));
        });

        socket.on(EVENTS.getPosition, () => {
            socket.emit(EVENTS.position, entity.getPos());
        });

        socket.on(EVENTS.disconnect, (reason) => {
            server.deleteEntity(entity);
        });
    }

    reset(properties) {
        this.entityServer.reset(properties);
        console.log("Server reset");
    }
}
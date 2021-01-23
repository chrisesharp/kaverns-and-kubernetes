"use strict";

import Tile from '../common/tile.js';

export const nullTile = new Tile();

export const floorTile = new Tile({
    char: '.',
    walkable: true,
    blocksLight: false,
    description: 'A cave floor'
});

export const wallTile = new Tile({
    char: '#',
    foreground: 'goldenrod',
    diggable: true,
    description: 'A cave wall'
});

export const stairsUpTile = new Tile({
    char: '<',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A rock staircase leading upwards'
});

export const stairsDownTile = new Tile({
    char: '>',
    foreground: 'white',
    walkable: true,
    blocksLight: false,
    description: 'A rock staircase leading downwards'
});

import * as Tiles from "./server-tiles.js";
export { Tiles };
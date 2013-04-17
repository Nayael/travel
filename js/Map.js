// The Map class file
(function() {
    var Map = function() {
        this.TS = 32;           // The size of a tile in pixels
        this.obstacles = [1];   // Indexes in the tilemap that correspond to physical obstacles
        this.npcs      = [2];   // Indexes in the tilemap that correspond to physical obstacles
        this.tilemap   = window.map;   // Getting the map from the global object

        this.scrollable = true;
        this.scrollX = 0;
        this.scrollY = 0;

        this.scrollXMin = 200;
        this.scrollXMax = 600;
        this.scrollYMin = 100;
        this.scrollYMax = 400;
    };

    /**
     * Draws the map
     * @param  {Canvas2DContext} context The 2D context of the canvas to render in
     */
    Map.prototype.draw = function(context) {
        var rows = this.tilemap.length,
            cols, tileX, tileY;
        for (var i = 0, j = 0; i < rows; i++) {
            cols = this.tilemap[i].length;
            for (j = 0; j < cols; j++) {
                tileX = (j * this.TS - this.scrollX);
                tileY = (i * this.TS - this.scrollY);
                // Drawing tiles
                if (this.obstacles.indexOf(this.tilemap[i][j]) != -1 && tileX > -this.TS && tileX < Game.CANVAS_WIDTH && tileY > -this.TS && tileY < Game.CANVAS_HEIGHT) {
                    context.fillRect(tileX, tileY, this.TS, this.TS);
                    context.drawImage(Game.images[Game.player.name].tiles, this.tilemap[i][j] * this.TS, 0, this.TS, this.TS, tileX, tileY, this.TS, this.TS);
                // Creating NPCs that will be drawn
                } else if (this.npcs.indexOf(this.tilemap[i][j]) != -1 && tileX > -this.TS && tileX < Game.CANVAS_WIDTH && tileY > -this.TS && tileY < Game.CANVAS_HEIGHT) {
                    // If the NPC ins't already on the stage
                    if (Game.npcs[i * this.tilemap[i].length + j] == undefined && Game.player.npcMapIndex != (i * this.tilemap[i].length + j)) {
                        Game.Npc.pop(this.tilemap[i][j], j, i);
                    }
                }
            }
        }
    };

    /**
     * Manually fix the scrolling
     */
    Map.prototype.scroll = function() {
        // If the scroll is already OK, don't do anything
        if (Game.player.x >= this.scrollXMin && Game.player.x <= this.scrollXMax && Game.player.y >= this.scrollYMin && Game.player.y <= this.scrollYMax) {
            return;
        }

        var dX = 0, dY = 0;
        var self = this;

        // X-axis scrolling
        if (Game.player.x < this.scrollXMin) {
            dX = this.scrollXMin - Game.player.x;
        } else if(Game.player.x + Game.player.body.width > this.scrollXMax) {
            dX = this.scrollXMax - (Game.player.x + Game.player.body.width);
        }

        var xInterval = 0, yInterval = 0;

        if (dX != 0) {
            xInterval = (Game.Npc.STUN_TIME / Math.abs(dX)) | 0;
            self.scrollX += dX < 0 ? 1 : -1;
            var xTimer = setInterval(function() {
                if (!self.scrollable || (Game.player.x >= self.scrollXMin && Game.player.x + Game.player.body.width <= self.scrollXMax)) {
                    clearInterval(xTimer);
                    return;
                }
                self.scrollX += dX < 0 ? 1 : -1;
            }, xInterval);
        }

        // Y-axis scrolling
        if (Game.player.y < this.scrollYMin) {
            dY = this.scrollYMin - Game.player.y;
        } else if(Game.player.y + Game.player.body.height > this.scrollYMax) {
            dY = this.scrollYMax - (Game.player.y + Game.player.body.height);
        }

        if (dY != 0) {
            yInterval = (Game.Npc.STUN_TIME / Math.abs(dY)) | 0;
            self.scrollY += dY < 0 ? 1 : -1;
            var yTimer = setInterval(function() {
                if (!self.scrollable || (Game.player.y >= self.scrollYMin && Game.player.y + Game.player.body.height <= self.scrollYMax)) {
                    clearInterval(yTimer);
                    return;
                }
                self.scrollY += dY < 0 ? 1 : -1;
            }, yInterval);
        }
    };

    Game.Map = Map;
})();
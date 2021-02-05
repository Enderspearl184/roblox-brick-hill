     function fakehitDetection() {
        let scale = [];
        let origin = [];
        scale[0] = this.scale.x / 2;
        scale[1] = this.scale.y / 2;
        scale[2] = this.scale.z / 2;
        origin[0] = this.position.x + scale[0];
        origin[1] = this.position.y + scale[1];
        origin[2] = this.position.z + scale[2];
        const players = Game.allPlayers;
        for (const p of players) {
            let size = [];
            size[0] = p.scale.x;
            size[1] = p.scale.y;
            size[2] = 5 * p.scale.z / 2;
            let center = [];
            center[0] = p.position.x;
            center[1] = p.position.y;
            center[2] = p.position.z + size[2];
            let touched = true;
            for (let i = 0; i < 3; i++) {
                let dist = Math.abs(origin[i] - center[i]);
                let close = size[i] + scale[i];
                if (dist >= close + 0.4) {
                    touched = false;
                }
            }
            if (touched && p.alive) {
                this._playersTouching.add(p);
                this.emit("touching", p);
            }
            if (this._playersTouching.has(p) && (!touched || !p.alive)) {
                this._playersTouching.delete(p);
                this.emit("touchingEnded", p);
            }
        }
    }

setInterval(()=>{
	world.bricks.forEach((brick)=>{
		brick._hitDetection=fakehitDetection
	})
},1000)

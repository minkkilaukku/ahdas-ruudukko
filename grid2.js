
class Grid {
    constructor(m, n, nums) {
        this.m = m;
        this.n = n;
        this.cells = new Array(m).fill(null).map(()=>new Array(n).fill(0));
        this.fitness = 0;
    }
    
    
    mutateToBest() {
        //TODO
    }
    
    mutate(prob) {
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                if (randBool(prob)) {
                    this.cells[i][j] = Grid.getRandDigit();
                }
            }
        }
    }
    
    /** Returns the direction it is found, or null if couldn't find */
    findNumFrom(numS, i0, j0) {
        for (let [di, dj] of Grid.DIRS) {
            let i = i0;
            let j = j0;
            let mistake = false;
            for (let c of numS) {
                if (i<0 || i>=this.m || j<0 || j>=this.n || c!==this.cells[i][j].toString()) {
                    mistake = true;
                    break;
                }
                i += di;
                j += dj;
            }
            if (!mistake) return [di, dj];
        }
        return null;
    }
    
    findNum(numS) {
        let startChar = numS.charAt(0);
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                if (this.cells[i][j].toString() === startChar) {
                    let place = this.findNumFrom(numS, i, j);
                    if (place) return place;
                }
            }
        }
        return null;
    }
    
    findFitness() {
        let s = 0;
        for (let num of Grid.NUMS) {
            let numS = num.toString();
            let place = this.findNum(numS);
            if (!place) {
                s += numS.length;
            }
        }
        this.fitness = 1/(s+1)**2;
        
    }
    
    toString() {
        return this.cells.map(row=>row.join("")).join("\n");
    }
    
    makeHTMLElem() {
        const a = this.cells;
        const getMax = arr=>Math.max.apply(Math, arr);
        const maxLen = getMax(a.map(r=>getMax(r.map(x=>x?x.length:0))));
        const getFillStyle = (i, j) => {
            return "#000";
        };
        const c = document.createElement("canvas");
        c.classList.add("grid");
        const cellW = (Grid.CANVAS_CELL_W || 40);
        const cellH = (Grid.CANVAS_CELL_H || 40);
        c.width = cellW * this.m;
        c.height = cellW * this.n;
        const ctx = c.getContext("2d");
        ctx.font = (0.95*cellW)+"px Helvetica";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                ctx.fillStyle = getFillStyle(i, j);
                let digit = a[i][j];
                ctx.fillText(digit, (i+0.5)*cellW, (j+0.5)*cellH, cellW);
            }
        }
        
        const ret = document.createElement("div");
        ret.classList.add("gridEl");
        ret.appendChild(c);
        const infoEl = document.createElement("p");
        infoEl.innerHTML = this.fitness.toFixed(7);
        ret.appendChild(infoEl);
        return ret;
    }
}

Grid.cleanNums = luvut => {
    const pal = [];
    for (let x of luvut) {
        const xStr = x.toString(10);
        if (pal.every(y=>y.toString(10).indexOf(xStr)<0)) {
            pal.push(x);
        }
    }
    return pal;
};

/** Set grid size mxn and squares upto k^2 */
Grid.setParams = (m, n, k) => {
    Grid.M = m;
    Grid.N = n;
    Grid.NUMS = Grid.cleanNums(new Array(k).fill(null).map((_,i)=>(i+1)**2).reverse());
};

Grid.setParams(4, 5, 20);

Grid.DIRS = [ [-1,-1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1,-1], [1, 0], [1, 1] ];
Grid.DIRS_0 = [ [-1, 0], [1, 0] ];
Grid.DIRS_1 = [ [0, -1], [0, 1] ];

Grid.getRandDir = (numLen) => {
    if (numLen>Grid.N) return Grid.DIRS_0[randInt(0, Grid.DIRS_0.length-1)];
    if (numLen>Grid.M) return Grid.DIRS_1[randInt(0, Grid.DIRS_1.length-1)];
    return Grid.DIRS[randInt(0, Grid.DIRS.length-1)];
}


Grid.makeRand = () => {
    const r = new Grid(Grid.M, Grid.N);
    for (let i=0; i<Grid.M; i++) {
        for (let j=0; j<Grid.N; j++) {
            r.cells[i][j] = Grid.getRandDigit();
        }
    }
    return r;
};

Grid.getRandDigit = ()=>randInt(0, 9);


Grid.cross = (a, b) => {
    const r = new Grid(Grid.M, Grid.N, Grid.NUMS);
    for (let i=0; i<Grid.M; i++) {
        for (let j=0; j<Grid.N; j++) {
            r.cells[i][j] = (randBool(0.5) ? a : b).cells[i][j];
        }
    }
    return r;
};
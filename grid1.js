
class Grid {
    constructor(m, n, nums) {
        this.m = m;
        this.n = n;
        this.placing = {};
        //this.placing = nums.reduce((ob,x)=>{ob[x]={place: [0,0], dir:[0,1]}; return ob;}, {});
        this.fitness = 0;
    }
    
    //TODO mutate by finding the best replacement for each num (in the current situation)
    
    mutateToBest() {
        const a = this.makeBoard();
        const takeAway = num => {
            let [i, j] = this.placing[num].place;
            const [di, dj] = this.placing[num].dir;
            for (let c of num) {
                a[i][j].splice(a[i][j].indexOf(c), 1);
                i += di;
                j += dj;
            }
        };
        const putTo = (num, place) => {
            let [i, j] = place.place;
            const [di, dj] = place.dir;
            for (let c of num) {
                if (a[i][j]===null) a[i][j] = [];
                a[i][j].push(c);
                i += di;
                j += dj;
            }
        };
        const countScore = (num, i0, j0, d) => {
            let s = 0;
            let i = i0;
            let j = j0;
            const [di, dj] = d;
            for (let c of num) {
                if (a[i][j]!==null && a[i][j].some(x=>x!==c)) s+= 1;
                i += di;
                j += dj;
            }
            return s;
        };
        const findBestPlace = num => {
            let numLen = num.length;
            let bestScore = Infinity;
            let bestPlace = null;
            for (let d of Grid.DIRS) {
                for (let i=d[0]<0?numLen-1:0,iEnd=d[0]>0?this.m-numLen:this.m; i<iEnd; i++) {
                    for (let j=d[1]<0?numLen-1:0,jEnd=d[1]>0?this.n-numLen:this.n; j<jEnd; j++) {
                        let score = countScore(num, i, j, d);
                        if (score<bestScore) {
                            bestScore = score;
                            bestPlace = {place: [i,j], dir: d};
                        }
                    }
                }
            }
            return bestPlace;
        };
        for (let num of Object.keys(this.placing).sort(()=>Math.random()-0.5)) {
            takeAway(num);
            let p = findBestPlace(num);
            this.placing[num] = p;
            putTo(num, p);
        }
    }
    
    mutate(prob) {
        for (let num in this.placing) {
            if (randBool(prob)) this.placing[num] = Grid.getRandPlacing(num);
        }
    }
    
    /**Put the placings on a mxn board (2d-array).
    * Entry is null if there isn't any digit,
    * otherwise array of digits that land there (counting also same multiple times)
    */
    makeBoard() {
        const a = new Array(this.m).fill(null).map(()=>new Array(this.n).fill(null));
        for (let numS in this.placing) {
            let [di, dj] = this.placing[numS].dir;
            let [i, j] = this.placing[numS].place;
            for (let c of numS) {
                if (a[i][j]===null) a[i][j] = [];
                a[i][j].push(c);
                i += di;
                j += dj;
            }
        }
        return a;
    }
    
    findFitness() {
        let s = 0;
        const a = this.makeBoard();
        for (let i=0; i<this.m; i++) {
            for (let j=0; j<this.n; j++) {
                if (a[i][j]===null) continue;
                let {el, count} = getMostFrequent(a[i][j]);
                s += a[i][j].length-count;
                //s += a[i][j].reduce((cumu, x)=>cumu+(x!==el?1:0), 0);
            }
        }
        this.fitness = 1/(s+1)**2;
        /*
        const a = new Array(this.m).fill(null).map(()=>new Array(this.n).fill(null));
        let s = 0;
        for (let numS in this.placing) {
            let [di, dj] = this.placing[numS].dir;
            let [i, j] = this.placing[numS].place;
            for (let c of numS) {
                if (a[i][j]!==null) {
                    if (a[i][j]!==c) s += 1;
                } else {
                    a[i][j] = c;
                }
                i += di;
                j += dj;
            }
        }
        this.fitness = 1/(s+1)**2;
        */
    }
    
    toString() {
        return this.makeBoard().map(row=>row.map(x=>(x&&x.length)?x[0]:'_').join("")).join("\n");
    }
    
    makeHTMLElem() {
        const a = this.makeBoard();
        const getMax = arr=>Math.max.apply(Math, arr);
        const maxLen = getMax(a.map(r=>getMax(r.map(x=>x?x.length:0))));
        const getFillStyle = (i, j) => {
            if (a[i][j]===null) return "#fff";
            const arr = a[i][j];
            if (arr.every(x=>x===arr[0])) return "rgba(0,0,0,0.7)";
            return `rgba(${Math.floor(255*a[i][j].length/maxLen)}, 0, 0, 0.7)`;
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
                if (a[i][j] !== null) {
                    ctx.fillStyle = getFillStyle(i, j);
                    for (let digit of a[i][j]) {
                        ctx.fillText(digit, (i+0.5)*cellW, (j+0.5)*cellH, cellW);
                    }
                }
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

Grid.getRandPlacing = num => {
    const numS = num.toString();
    const numLen = numS.length;
    const dir = Grid.getRandDir(numLen);
    const i0 = randInt(dir[0]<0 ? numLen-1 : 0, dir[0]>0 ? Grid.M-numLen : Grid.M-1);
    const j0 = randInt(dir[1]<0 ? numLen-1 : 0, dir[1]>0 ? Grid.N-numLen : Grid.N-1);
    return {place: [i0, j0], dir: dir};
};

Grid.makeRand = () => {
    const r = new Grid(Grid.M, Grid.N, Grid.NUMS);
    r.placing = {};
    for (let num of Grid.NUMS) {
        r.placing[num] = Grid.getRandPlacing(num);
    }
    return r;
};


Grid.cross = (a, b) => {
    const ret = new Grid(Grid.M, Grid.N, Grid.NUMS);
    ret.placing = {};
    for (let num of Grid.NUMS) {
        ret.placing[num] = (randBool(0.5) ? a : b).placing[num];
    }
    return ret;
};



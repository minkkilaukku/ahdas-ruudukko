
class GenAlg {
    constructor(elClass, poolSize, mutateProb, randFrac=0.1) {
        this.elClass = elClass;
        this.poolSize = poolSize;
        this.pool = new Array(poolSize).fill(null).map(()=>elClass.makeRand());
        this.mutateProb = mutateProb;
        this.randFrac = randFrac;
        this.calcFitnesses();
        
        this.generation = 0;
    }
    
    calcFitnesses() {
        this.pool.forEach(x=>x.findFitness());
        this.pool.sort((a,b)=>b.fitness-a.fitness);
    }
    
    select(percent, bestNum=1) {
        const ret = this.pool.slice(0, bestNum);
        const pool2 = this.pool.slice(bestNum);
        const selSize = Math.floor(this.pool.length*percent);
        let fTot = pool2.reduce((cumu, x)=>cumu+x.fitness, 0);
        const getRandInd = () => {
            let u = Math.random()*fTot;
            let cum = 0;
            let i = -1;
            do {
                i++;
                cum += pool2[i].fitness;
            } while(cum<u && i<pool2.length);
            return i;
        };
        const getRand = () => {
            let ind = getRandInd();
            let ret = pool2.splice(ind, 1)[0];
            fTot -= ret.fitness;
            return ret;
        };
        while (ret.length<selSize) {
            ret.push(getRand());
        }
        return ret;
    }
    
    
    evolve() {
        const sel = this.select(0.25);
        const nextPool = sel.slice(0);
        const selMax = sel.length-1;
        const getRandSelParents = ()=> {
            let aI = randIntW(0, selMax, 3);
            let bI;
            if (aI<selMax) {
                bI = randIntW(aI, selMax, 2);
            } else if (aI>0) {
                bI = randIntW(0, aI, 2);
            } else {
                bI = randIntW(0, selMax, 2);
            }
            return [sel[aI], sel[bI]];
        };
        const newRandsTot = Math.floor(this.randFrac*this.poolSize);
        let newRands = 0;
        while (newRands<newRandsTot) {
            let el = this.elClass.makeRand();
            nextPool.push(el);
            newRands++;
        }
        while (nextPool.length<this.poolSize) {
            let [a, b] = getRandSelParents();
            let el = this.elClass.cross(a, b);
            el.mutate(this.mutateProb);
            nextPool.push(el);
        }
        nextPool.forEach(x=>x.mutateToBest());
        this.pool = nextPool;
        this.calcFitnesses();
        this.generation += 1;
    }
    
    getAverageFitness() {
        return this.pool.reduce((cumu,x)=>cumu+x.fitness,0)/this.pool.length;
    }
    
    hasAMaxFit() {
        return this.pool[0] && this.pool[0].fitness===1;
    }
}





Grid.setParams(4, 5, 20);
Grid.CANVAS_CELL_W = 20;
Grid.CANVAS_CELL_H = 20;
let showN = 6;
let tickWait = 40;

const ga = new GenAlg(Grid, 200, 0.03);

const viewPool = document.createElement("div");
document.body.appendChild(viewPool);

viewPool.set = function(pool) {
    this.innerHTML = "";
    for (let x of pool) {
        this.appendChild(x.makeHTMLElem());
    }
};

const infoText = document.createElement("p");
infoText.update = () => {
    infoText.innerHTML = ("Generation: "+ga.generation
                +"<br/>Best fitness: "+ga.pool[0].fitness.toFixed(7)
                +"<br/>Average fitness: "+ga.getAverageFitness().toFixed(7));
};
infoText.update();
document.body.appendChild(infoText);


let contEvol = false;

const evolveIter = function() {
    ga.evolve();
    viewPool.set(ga.pool.slice(0, showN));
    infoText.update();
    if (contEvol && ga.hasAMaxFit()) {
        stopEvolve();
        console.log("Grid of fitness 1 found in generation "+ga.generation);
        console.log(ga.pool[0].toString());
    }
};

const startEvolve = () => {
    contEvol = true;
    evolveButt.innerHTML = "evolving...";
    evolveButt.disabled = true;
    evolveOnceButt.disabled = true;
    stopEvolveButt.disabled = false;
    const tick = () => {
        evolveIter();
        if (contEvol) setTimeout(tick, tickWait);
    }
    setTimeout(tick, 0);
};

const stopEvolve = () => {
    contEvol = false;
    stopEvolveButt.disabled = true;
    evolveButt.innerHTML = "start evolution";
    evolveButt.disabled = false;
    evolveOnceButt.disabled = false;
};

const evolveOnceButt = document.createElement("button");
evolveOnceButt.innerHTML = "evolve once";
evolveOnceButt.onclick = ()=> {
   evolveIter();   
};
document.body.appendChild(evolveOnceButt);

const evolveButt = document.createElement("button");
evolveButt.innerHTML = "start evolution";
evolveButt.onclick = ()=> {startEvolve();};
document.body.appendChild(evolveButt);

const stopEvolveButt = document.createElement("button");
stopEvolveButt.innerHTML = "stop";
stopEvolveButt.onclick = ()=>{stopEvolve();};
stopEvolveButt.disabled = true;
document.body.appendChild(stopEvolveButt);


viewPool.set(ga.pool.slice(0, showN));
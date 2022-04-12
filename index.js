var nodes = null;
var edges = null;
var network = null;
var Nz = 5;
// var Nz = -1;
var seed = 2;

function toJSON(obj) {
    return JSON.stringify(obj.get(), null, 4);
}

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

function random_graph(x) {
    return getScaleFreeNetwork(x);
}

function draw() {
    destroy();
    var data = {
        nodes: nodes,
        edges: edges,
    };

    // create a network
    var container = document.getElementById("mynetwork");
    var options = {
        nodes: {
            shape: "dot",
            size: 20,
            font: {
                size: 22,
            },
            color: {
                border: "#000",
                background: "#fff",
                highlight: {
                    border: "#7fff00",
                    background: "#7fff00",
                },
                hover: {
                    border: "#2B7CE9",
                    background: "#D2E5FF",
                },
            },
            borderWidth: 2,
            shadow: true,
        },
        edges: {
            width: 2,
            shadow: true,
            font: {
                size: 18,
                align: "top",
            },
        },
        layout: {
            randomSeed: seed,
        }, // just to make sure the layout is the same when the locale is changed
        // locale: document.getElementById("locale").value,
        interaction: {
            keyboard: true,
            hover: true,
        },
        manipulation: {
            // enabled: false,
            addNode: function (data, callback) {
                // filling in the popup DOM elements
                document.getElementById("operation").innerText = "Add Node";
                document.getElementById("operation-text").innerText = "Node ID";
                document.getElementById("node-id").value = Nz++;
                document.getElementById("saveButton").onclick = saveData.bind(
                    this,
                    data,
                    callback
                );
                document.getElementById("cancelButton").onclick =
                    clearPopUp.bind();
                document.getElementById("network-popUp").style.display =
                    "block";
            },
            addEdge: function (data, callback) {
                if (data.from == data.to) {
                    var r = confirm(
                        "Do you want to connect the node to itself?"
                    );
                    if (r != true) {
                        callback(null);
                        return;
                    }
                }
                document.getElementById("operation").innerText = "Add Edge";
                editEdge(data, callback);
            },
            editEdge: function (data, callback) {
                if (data.from == data.to) {
                    var r = confirm(
                        "Do you want to connect the node to itself?"
                    );
                    if (r != true) {
                        callback(null);
                        return;
                    }
                }
                document.getElementById("operation").innerText = "Edit edge";
                editEdge(data, callback);
            },
        },
    };
    network = new vis.Network(container, data, options);
}

function clearPopUp() {
    document.getElementById("saveButton").onclick = null;
    document.getElementById("cancelButton").onclick = null;
    document.getElementById("network-popUp").style.display = "none";
}

function cancelEdit(callback) {
    clearPopUp();
    callback(null);
}

function saveData(data, callback) {
    data.label = document.getElementById("node-id").value;
    data.id = parseInt(data.label);
    clearPopUp();
    callback(data);
}

function editEdge(data, callback) {
    // filling in the popup DOM elements
    document.getElementById("operation-text").innerText = "Edge Value";
    document.getElementById("node-id").value = data.label;
    document.getElementById("saveButton").onclick = saveEdgeData.bind(
        this,
        data,
        callback
    );
    document.getElementById("cancelButton").onclick = cancelEdit.bind(
        this,
        callback
    );
    document.getElementById("network-popUp").style.display = "block";
}

function saveEdgeData(data, callback) {
    if (typeof data.to === "object") data.to = data.to.id;
    if (typeof data.from === "object") data.from = data.from.id;
    data.label = document.getElementById("node-id").value;
    clearPopUp();
    callback(data);
}

function init() {
    nodes = new vis.DataSet();
    edges = new vis.DataSet();

    Nz = 5;
    // Nz = -1;
    inidata = random_graph(Nz++);

    nodes.add(inidata.nodes);
    edges.add(inidata.edges);

    // console.log(toJSON(nodes));
    // console.log(toJSON(edges));

    draw();
}

// algos...

var N, E; // set of nodes & edges
var n; // # of nodes
var mp = {};
const rmp = []; // reverse mapping
var adj = []; // adjaceny list

function init_algo() {
    (N = nodes.get()), (E = edges.get());
    n = N.length;
    let z = 0;
    for (i in N) {
        let id = N[i].id;
        rmp[z] = id;
        mp[id] = z++;
    }
    adj = new Array(n);
    for (let i = 0; i < n; i++) {
        adj[i] = new Array();
    }

    for (e in E) {
        let u = E[e].from,
            v = E[e].to;
        u = mp[u];
        v = mp[v];
        if (u > v) {
            let tmp = u;
            u = v;
            v = tmp;
        }
        // console.log(u, v)
        adj[u].push(v);
        adj[v].push(u);
    }
}

function Complement() {
    init_algo();

    edges.clear();
    for (let i = 0; i < n; i++) {
        let vis = new Array(n);
        for (let j = 0; j < adj[i].length; j++) {
            let x = adj[i][j];
            if (i < x) {
                vis[x] = 1;
            }
        }

        for (let j = i + 1; j < n; j++) {
            if (vis[j] == 1) continue;
            edges.add({
                from: rmp[i],
                to: rmp[j],
            });
        }
    }
}

var color = [];
var isbipartie;

function dfs(s) {
    for (let j = 0; j < adj[s].length; j++) {
        let x = adj[s][j];
        if (color[x] == 0) {
            // console.log(x)
            color[x] = 3 - color[s];
            dfs(x);
        } else if (color[s] + color[x] !== 3) {
            isbipartie = 0;
        }
    }
}

function Bipartie() {
    init_algo();
    color = new Array(n).fill(0);
    isbipartie = 1;

    for (let i = 0; i < n; i++) {
        if (color[i] == 0) {
            color[i] = 1;
            dfs(i);
        }
    }
    if (isbipartie == 0) {
        alert("Given Graph is not Bipartie.");
        return;
    }

    for (let i = 0; i < n; i++) {
        nodes.update({
            id: rmp[i],
            group: color[i] - 1,
        });
    }
}

function SpanningTree() {}

// var circuitEuler = []; // Euler circuit
// var visitedEuler = [];
// var ed = [];

// function DfsEuler(node) {
//     visitedEuler[node] = 1;
//     circuitEuler.push(node);
//     for (let j = 0; j < adj[node].length; j++) {
//         for (k in E) {
//             if (k.from === node && k.to === j) {
//                 ed[node][j] = 1;
//                 break;
//             } else if (k.to === node && k.from === j) {
//                 ed[j][node] = 1;
//                 break;
//             }
//         }
//         let next = adj[node][j];
//         if (visitedEuler[next] == 0) {
//             DfsEuler(next);
//         } else if (ed[node][j] === -1 || ed[j][node] === -1) {
//             DfsEuler(next);
//         }
//     }
//     return;
// }

function EulerCircuit() {
    init_algo();

    var isEulerian = true;
    var count = 0;

    for (let i = 0; i < n; i++) {
        if (adj[i].length % 2 != 0) {
            isEulerian = false;
            alert("Given Graph does not have a Eulerian cycle.");
            return;
        }
    }

    // for (let i = 0; i < n; i++) {
    //     ed[i] = new Array(n).fill(-1);
    // }

    // visitedEuler = new Array(n).fill(0);

    // for (let i = 0; i < n; i++) {
    //     if (visitedEuler[i] == 0) {
    //         count = count + 1;
    //         if (count === 2) {
    //             isEulerian = false;
    //             alert("Given Graph does not have a Eulerian cycle.");
    //             return;
    //         }
    //         DfsEuler(i);
    //     }
    // }

    // let cir = "";

    // for (let i = 0; i < n; i++) {
    //     cir = cir + circuitEuler[i] + " ";
    // }

    // cir = cir + circuitEuler[0];

    alert("Given Graph has a Eulerian cycle");

    // for (let i = 0; i < n; i++) {
    //     EulerianUpdate(i);
    // }

    // function EulerianUpdate(i) {
    //     setTimeout(function () {
    //         nodes.update({
    //             id: rmp[i],
    //             color: {
    //                 border: "#000",
    //                 background: "#189AB4",
    //             },
    //         });
    //     }, 2000);
    // }
}

function Degree() {
    init_algo();
    for (let i = 0; i < n; i++) {
        network.canvas.body.nodes[rmp[i]].options.title =
            "Degree " + adj[i].length;
    }
}

function HHA() {
    var sequence = [];
    var lengthSeq = sequence.length;

    while (true) {
        sequence.sort((first, second) => second - first);

        if (sequence[0] == 0) {
            alert("Graph is possible.");
            return;
        }

        var first = sequence[0];
        sequence.shift();

        if (first > sequence.length) {
            alert("Graph not possible.");
            return;
        }

        for (var i = 0; i < first; i++) {
            sequence[i]--;

            if (sequence[i] < 0) {
                alert("Graph not possible.");
                return;
            }
        }
    }
}

init();

// network.on("selectNode", function (properties) {
// 	var ids = properties.nodes;
// 	if (ids.length !== 0) {
// 		network.canvas.body.nodes[ids[0]].options.title =
// 			"Degree " + properties.edges.length;
// 	}
// });

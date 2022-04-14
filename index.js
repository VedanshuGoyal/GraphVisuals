var nodes = new vis.DataSet();
var edges = new vis.DataSet();
var network = null;
var Nz = 5;
var seed = 2;
var isonchange = 0;

function updateTextarea() {
    let z = document.getElementById("edgedata");
    z.value = "";
    E = edges.get();

    for (e in E) {
        let u = E[e].from,
            v = E[e].to,
            d = E[e].label;
        z.value += u;
        z.value += " ";
        z.value += v;
        if (d !== undefined && d.length > 0) {
            z.value += " ";
            z.value += d;
        }
        z.value += "\n";
    }

    N = nodes.get();

    let o = document.getElementById("order");
    let s = document.getElementById("size");
    o.innerText = N.length.toString();
    s.innerText = E.length.toString();
}

nodes.on("*", function (event, properties, senderId) {
    if (isonchange) return;
    updateTextarea();
});

edges.on("*", function (event, properties, senderId) {
    if (isonchange) return;
    updateTextarea();
});

function changetextarea() {
    isonchange = 1;

    edges.clear();
    nodes.clear();
    let map = {};
    let z = document.getElementById("edgedata").value;
    console.log(z);
    z += "\n";

    let s = "";
    let sc = [];
    for (let c of z) {
        if (c == "\n" || c == " ") {
            if (s.length > 0) sc.push(s);
            s = "";
            if (c == "\n") {
                if (sc.length == 1) {
                    let u = sc[0];
                    nodes.update({ id: parseInt(u), label: u });
                } else if (sc.length <= 3) {
                    let u = sc[0],
                        v = sc[1];
                    nodes.update({ id: parseInt(u), label: u });
                    nodes.update({ id: parseInt(v), label: v });
                    if (sc.length == 3) {
                        let d = sc[2];
                        edges.update({
                            from: parseInt(u),
                            to: parseInt(v),
                            label: d,
                        });
                    } else {
                        edges.update({ from: parseInt(u), to: parseInt(v) });
                    }
                } else {
                }
                sc = [];
            }
        } else {
            s += c;
        }
    }

    isonchange = 0;
}

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

    // updateTextarea();

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
            // keyboard: true,
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
    network.on("hoverNode", function (properties) {
        Degree();
    });

    network.on("doubleClick", function (params) {
        if (params.nodes.length == 0) return;
        nid = parseInt(params.nodes);
        var node = nodes.get(nid);
        var z =
            node.physics == undefined || node.physics == true ? false : true;
        var bw = node.physics == undefined || node.physics == true ? 4 : 2;
        nodes.update({
            id: nid,
            physics: z,
            borderWidth: bw,
            color: { highlight: "DA70D6" },
        });
    });
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
    document.getElementById("node-id").value = "";
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
    nodes.clear();
    edges.clear();
    // nodes = new vis.DataSet();
    // edges = new vis.DataSet();

    Nz = 5;
    inidata = random_graph(Nz);

    nodes.add(inidata.nodes);
    edges.add(inidata.edges);

    // nodes.add({id : 31, label : "31"});
    // console.log(toJSON(nodes));

    draw();
}

// algos...

var N, E; // set of nodes & edges
var n, ne; // # of nodes, # of edges
var mp = {};
var rmp = []; // reverse mapping
var adj = []; // adjaceny list

function init_algo() {
    rmp = [];
    mp = {};
    (N = nodes.get()), (E = edges.get());
    // console.log(E)
    n = N.length;
    e = E.length;
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

function DfsConnect(node) {
    visit[node] = 1;
    for (let j = 0; j < adj[node].length; j++) {
        let next = adj[node][j];
        if (visit[next] == 0) {
            DfsConnect(next);
        }
    }
    return;
}

var visit = [];

function SpanningTree() {
    init_algo();

    var count = 0;
    var isConnected = true;
    visit = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        if (visit[i] == 0) {
            count = count + 1;
            if (count === 2) {
                isConnected = false;
                alert("Given Graph is not connected.");
                return;
            }
            DfsConnect(i);
        }
    }

    var graph = new jsgraphs.WeightedGraph(Nz);
    let edgesCount = E.length;

    for (let i = 0; i < edgesCount; i++) {
        if (E[i].label) {
            graph.addEdge(
                new jsgraphs.Edge(E[i].from, E[i].to, parseInt(E[i].label))
            );
        } else {
            edges.update({ id: E[i].id, label: "1" });
            E[i].label = "1";
            graph.addEdge(
                new jsgraphs.Edge(E[i].from, E[i].to, parseInt(E[i].label))
            );
        }
    }

    var kruskal = new jsgraphs.KruskalMST(graph);
    var mst = kruskal.mst;

    for (let j = 0; j < mst.length; j++) {
        for (let k = 0; k < edgesCount; k++) {
            if (
                E[k].from == mst[j].v &&
                E[k].to == mst[j].w &&
                parseInt(E[k].label) == mst[j].weight
            ) {
                // console.log(E[k].id)
                edges.update({
                    id: E[k].id,
                    width: 5,
                    color: "#000",
                });
                break;
            }
        }
    }

    for (let i = 0; i < n; i++) {
        nodes.update({
            id: rmp[i],
            color: { background: "#675B7F" },
        });
    }
}

var eg = []; // adjacency list for euler graph
var edge_order = [];

function init_euler() {
    eg = new Array(n);
    edge_order = new Array();
    visit = new Array(ne).fill(0);

    for (let i = 0; i < n; i++) {
        eg[i] = new Array();
    }

    let z = 0;
    for (e in E) {
        let u = E[e].from,
            v = E[e].to;
        u = mp[u];
        v = mp[v];
        eg[u].push([v, z]);
        eg[v].push([u, z]);
        z++;
    }
}

function eulerdfs(s, edn) {
    // node, edge num
    for (let j = 0; j < eg[s].length; j++) {
        let x = eg[s][j];
        if (vis[x[1]]) continue;

        vis[x[1]] = 1;
        eulerdfs(x[0]);
        edge_order.push(x[1]);
    }
}

function EulerCircuit() {
    init_algo();
    init_euler();

    for (let i = 0; i < n; i++) {
        if (adj[i].length % 2 != 0) {
            alert("Given Graph does not have a Eulerian cycle.");
            return;
        }
    }

    eulerdfs(0, -1);
    edge_order.reverse();

    for (let i = 0; i < edge_order.length; i++) {
        edges.update({
            id: E[edge_order[i]].id,
            label: i.toString(),
            width: 5,
            font: {
                color: "#DE3163",
                size: 23,
            },
        });
    }
}

function Degree() {
    init_algo();
    for (let i = 0; i < n; i++) {
        network.canvas.body.nodes[rmp[i]].options.title =
            "Degree " + adj[i].length;
    }
}

function graphHHA(sequence, lengthSeq) {
    let newGraph = new Array(lengthSeq);
    for (let index = 0; index < lengthSeq; index++) {
        newGraph[index] = new Array(lengthSeq).fill(0);
    }

    for (let i = 0; i < lengthSeq; i++) {
        for (let j = i + 1; j < lengthSeq; j++) {
            if (sequence[i] > 0 && sequence[j] > 0) {
                sequence[i] = sequence[i] - 1;
                sequence[j] = sequence[j] - 1;
                newGraph[i][j] = 1;
                newGraph[j][i] = 1;
            }
        }
    }

    nodes.clear();
    edges.clear();

    Nz = lengthSeq;

    data = random_graph(lengthSeq);
    nodes.add(data.nodes);
    edges.add(data.edges);

    draw();

    edges.clear();

    let col = 1;

    for (let i = 0; i < lengthSeq; i++) {
        for (let j = col; j < lengthSeq; j++) {
            if (newGraph[i][j] == 1) {
                edges.add({
                    from: i,
                    to: j,
                });
            }
        }
        col++;
    }
}

function HHA() {
    let inString = prompt("Enter space seperated degree sequence.", "");
    if (!inString) {
        alert("No sequence provided.");
        return;
    }

    var isWrong = false;

    try {
        var sequence = inString.split(" ").map((str) => {
            if (isNaN(str)) {
                alert("Wrong input.");
                throw BreakError;
            } else {
                return parseInt(str);
            }
        });
    } catch (err) {
        // if (err !== BreakError) throw err;
        isWrong = true;
    }

    // console.log("s", sequence[0]);
    // if (isNaN(sequence)) {
    //     alert("Wrong input.");
    //     return;
    // }

    if (isWrong) {
        return;
    }

    var lengthSeq = sequence.length;

    var degreeSeq = [];
    Array.prototype.push.apply(degreeSeq, sequence);

    while (true) {
        sequence.sort((first, second) => second - first);

        if (sequence[0] == 0) {
            graphHHA(degreeSeq, lengthSeq);
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

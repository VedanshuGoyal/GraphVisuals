var nodes = null;
var edges = null;
var network = null;
var Nz = 5;
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
				border: '#000',
				background: '#fff',
				highlight: {
					border: '#7fff00',
					background: '#7fff00'
				},
				hover: {
					border: '#2B7CE9',
					background: '#D2E5FF'
				}
			},
			borderWidth: 2,
			shadow: true,
		},
		edges: {
			width: 2,
			shadow: true,
		},
		layout: {
			randomSeed: seed
		}, // just to make sure the layout is the same when the locale is changed
		// locale: document.getElementById("locale").value,
		interaction: {
			keyboard: true
		},
		manipulation: {
			// enabled: false,
			addNode: function(data, callback) {
				// filling in the popup DOM elements

				document.getElementById("operation").innerText = "Add Node";
				document.getElementById("node-id").value = Nz++;
				document.getElementById("saveButton").onclick = saveData.bind(
					this,
					data,
					callback
				);
				document.getElementById("cancelButton").onclick =
					clearPopUp.bind();
				document.getElementById("network-popUp").style.display = "block";
			},
			// editNode: function (data, callback) {
			//   // filling in the popup DOM elements
			//   document.getElementById("operation").innerText = "Edit Node";
			//   document.getElementById("node-id").value = data.id;
			//   document.getElementById("saveButton").onclick = saveData.bind(
			//     this,
			//     data,
			//     callback
			//   );
			//   document.getElementById("cancelButton").onclick = cancelEdit.bind(
			//     this,
			//     callback
			//   );
			//   document.getElementById("network-popUp").style.display = "block";
			// },
			addEdge: function(data, callback) {
				if (data.from == data.to) {
					var r = confirm("Do you want to connect the node to itself?");
					if (r == true) {
						callback(data);
					}
				} else {
					callback(data);
				}
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

function init() {
	nodes = new vis.DataSet();
	edges = new vis.DataSet();

	Nz = 5;
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
	N = nodes.get(), E = edges.get();
	n = N.length;
	let z = 0;
	for (i in N) {
		let id = N[i].id;
		rmp[z] = id;
		mp[id] = z++;
	}
	adj = new Array(n);
	for (let i = 0; i < n; i++) {
		adj[i] = new Array;
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
				to: rmp[j]
			});
		}
	}
}


var color = []
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
	if (isbipartie == 0){
		alert("Given Graph is not Bipartie.");
		return;
	}

	for (let i = 0; i < n; i++) {
		nodes.update({
			id: rmp[i],
			group: color[i] - 1
		});
	}
}

function SpanningTree() {
	
}


init();
var jsgraphs = jsgraphs || {};

(function (jss) {
    jss.less = function (a1, a2, compare) {
        return compare(a1, a2) < 0;
    };

    jss.exchange = function (a, i, j) {
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    };
    var MinPQ = function (compare) {
        this.s = [];
        this.N = 0;
        if (!compare) {
            compare = function (a1, a2) {
                return a1 - a2;
            };
        }
        this.compare = compare;
    };

    MinPQ.prototype.enqueue = function (item) {
        while (this.s.lengh <= this.N + 1) {
            this.s.push(0);
        }
        this.s[++this.N] = item;
        this.swim(this.N);
    };

    MinPQ.prototype.swim = function (k) {
        while (k > 1) {
            var parent = Math.floor(k / 2);
            if (jss.less(this.s[k], this.s[parent], this.compare)) {
                jss.exchange(this.s, k, parent);
                k = parent;
            } else {
                break;
            }
        }
    };

    MinPQ.prototype.delMin = function () {
        if (this.N == 0) {
            return undefined;
        }

        var item = this.s[1];
        jss.exchange(this.s, 1, this.N--);
        this.sink(1);
        return item;
    };

    MinPQ.prototype.sink = function (k) {
        while (k * 2 <= this.N) {
            var child = 2 * k;
            if (
                child < this.N &&
                jss.less(this.s[child + 1], this.s[child], this.compare)
            ) {
                child++;
            }
            if (jss.less(this.s[child], this.s[k], this.compare)) {
                jss.exchange(this.s, child, k);
                k = child;
            } else {
                break;
            }
        }
    };

    MinPQ.prototype.size = function () {
        return this.N;
    };

    MinPQ.prototype.isEmpty = function () {
        return this.N == 0;
    };

    jss.MinPQ = MinPQ;

    var QuickUnion = function (V) {
        this.id = [];
        for (var v = 0; v < V; ++v) {
            this.id.push(v);
        }
    };

    QuickUnion.prototype.union = function (v, w) {
        var q = this.root(v);
        var p = this.root(w);

        if (p != q) {
            this.id[p] = q;
        }
    };

    QuickUnion.prototype.root = function (q) {
        while (this.id[q] != q) {
            q = this.id[q];
        }
        return q;
    };

    QuickUnion.prototype.connected = function (v, w) {
        return this.root(v) == this.root(w);
    };

    jss.QuickUnion = QuickUnion;

    var Edge = function (v, w, weight) {
        this.v = v;
        this.w = w;
        this.weight = weight;
    };

    Edge.prototype.either = function () {
        return this.v;
    };

    Edge.prototype.other = function (x) {
        return x == this.v ? this.w : this.v;
    };

    Edge.prototype.from = function () {
        return this.v;
    };

    Edge.prototype.to = function () {
        return this.w;
    };

    jss.Edge = Edge;

    var WeightedGraph = function (V) {
        this.V = V;
        this.adjList = [];
        this.nodeInfo = [];

        for (var v = 0; v < V; ++v) {
            this.adjList.push([]);
            this.nodeInfo.push({});
        }
    };

    WeightedGraph.prototype.adj = function (v) {
        return this.adjList[v];
    };

    WeightedGraph.prototype.edge = function (v, w) {
        var adj_v = this.adjList[v];
        for (var i = 0; i < adj_v.length; ++i) {
            var x = adj_v[i].other(v);
            if (x == w) {
                return adj_v[i];
            }
        }
        return null;
    };

    WeightedGraph.prototype.node = function (v) {
        return this.nodeInfo[v];
    };

    WeightedGraph.prototype.addEdge = function (e) {
        var v = e.either();
        var w = e.other(v);
        this.adjList[v].push(e);
        this.adjList[w].push(e);
    };

    jss.WeightedGraph = WeightedGraph;

    var KruskalMST = function (G) {
        var V = G.V;
        var pq = new jss.MinPQ(function (e1, e2) {
            return e1.weight - e2.weight;
        });
        for (var v = 0; v < G.V; ++v) {
            var adj_v = G.adj(v);
            for (var i = 0; i < adj_v.length; ++i) {
                var e = adj_v[i];
                if (e.either() != v) {
                    continue;
                }
                pq.enqueue(e);
            }
        }

        this.mst = [];

        var uf = new jss.QuickUnion(V);
        while (!pq.isEmpty() && this.mst.length < V - 1) {
            var e = pq.delMin();
            var v = e.either();
            var w = e.other(v);

            if (!uf.connected(v, w)) {
                uf.union(v, w);
                this.mst.push(e);
            }
        }
    };

    jss.KruskalMST = KruskalMST;
    
})(jsgraphs);

var module = module || {};
if (module) {
    module.exports = jsgraphs;
}

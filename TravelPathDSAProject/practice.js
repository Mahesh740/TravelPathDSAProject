window.onload = function () {
    var curr_data;
    var sz;
    var cities = ['Delhi', 'Mumbai', 'Gujarat', 'Goa', 'Kanpur', 'Jammu', 'Hyderabad', 'Bangalore', 'Gangtok', 'Meghalaya'];
    var container = document.getElementById('mynetwork');
    var container2 = document.getElementById('mynetwork2');
    var genNew = document.getElementById('generate-graph');
    var solve = document.getElementById('solve');
    var temptext = document.getElementById('temptext');
    var temptext2 = document.getElementById('temptext2');

    var options = {
        edges: { labelHighlightBold: true, font: { size: 20 } },
        nodes: {
            font: '12px arial red',
            scaling: { label: true },
            shape: 'icon',
            icon: { face: 'FontAwesome', code: '\uf015', size: 40, color: '#991133' }
        }
    };

    var network = new vis.Network(container);
    network.setOptions(options);
    var network2 = new vis.Network(container2);
    network2.setOptions(options);

    function createData() {
        sz = Math.floor(Math.random() * 8) + 3;
        let nodes = [];
        for (let i = 1; i <= sz; i++) {
            nodes.push({ id: i, label: cities[i - 1] });
        }
        nodes = new vis.DataSet(nodes);

        let edges = [];
        for (let i = 2; i <= sz; i++) {
            let neigh = i - Math.floor(Math.random() * Math.min(i - 1, 3) + 1);
            edges.push({ type: 0, from: i, to: neigh, color: 'orange', label: String(Math.floor(Math.random() * 70) + 31) });
        }

        src = 1;
        dst = sz;

        for (let i = 1; i <= sz / 2;) {
            let n1 = Math.floor(Math.random() * sz) + 1;
            let n2 = Math.floor(Math.random() * sz) + 1;
            if (n1 !== n2) {
                if (n1 < n2) [n1, n2] = [n2, n1]; // Swap values
                let works = 0;
                for (let j = 0; j < edges.length; j++) {
                    if (edges[j]['from'] === n1 && edges[j]['to'] === n2) {
                        works = edges[j]['type'] === 0 ? 1 : 2;
                    }
                }

                if (works <= 1) {
                    edges.push({
                        type: works === 0 && i < sz / 4 ? 0 : 1,
                        from: n1,
                        to: n2,
                        color: works === 0 ? 'orange' : 'green',
                        label: String(Math.floor(Math.random() * (works === 0 ? 70 : 50)) + 1)
                    });
                    i++;
                }
            }
        }

        curr_data = { nodes: nodes, edges: edges };
    }

    genNew.onclick = function () {
        createData();
        network.setData(curr_data);
        temptext2.innerText = 'Find least time path from ' + cities[src - 1] + ' to ' + cities[dst - 1];
        temptext.style.display = "inline";
        temptext2.style.display = "inline";
        container2.style.display = "none";
    };

    solve.onclick = function () {
        temptext.style.display = "none";
        temptext2.style.display = "none";
        container2.style.display = "inline";
        network2.setData(solveData(sz));
    };

    function dijkstra(graph, sz, src) {
        let vis = Array(sz).fill(0);
        let dist = Array.from({ length: sz }, () => [10000, -1]);
        dist[src][0] = 0;

        for (let i = 0; i < sz - 1; i++) {
            let mn = -1;
            for (let j = 0; j < sz; j++) {
                if (vis[j] === 0 && (mn === -1 || dist[j][0] < dist[mn][0])) mn = j;
            }

            vis[mn] = 1;
            for (let edge of graph[mn]) {
                if (!vis[edge[0]] && dist[edge[0]][0] > dist[mn][0] + edge[1]) {
                    dist[edge[0]][0] = dist[mn][0] + edge[1];
                    dist[edge[0]][1] = mn;
                }
            }
        }
        return dist;
    }

    function solveData(sz) {
        let data = curr_data;
        let graph = Array.from({ length: sz }, () => []);

        for (let edge of data.edges) {
            if (edge.type === 1) continue;
            graph[edge.to - 1].push([edge.from - 1, parseInt(edge.label)]);
            graph[edge.from - 1].push([edge.to - 1, parseInt(edge.label)]);
        }

        let dist1 = dijkstra(graph, sz, src - 1);
        let dist2 = dijkstra(graph, sz, dst - 1);
        let mn_dist = dist1[dst - 1][0];

        let plane = 0, p1 = -1, p2 = -1;
        for (let edge of data.edges) {
            if (edge.type === 1) {
                let [to, from, wght] = [edge.to - 1, edge.from - 1, parseInt(edge.label)];
                if (dist1[to][0] + wght + dist2[from][0] < mn_dist) {
                    [plane, p1, p2, mn_dist] = [wght, to, from, dist1[to][0] + wght + dist2[from][0]];
                }
            }
        }

        let new_edges = [];
        if (plane) {
            new_edges.push({ arrows: { to: { enabled: true } }, from: p1 + 1, to: p2 + 1, color: 'green', label: String(plane) });
            new_edges = new_edges.concat(pushEdges(dist1, p1, false), pushEdges(dist2, p2, true));
        } else {
            new_edges = new_edges.concat(pushEdges(dist1, dst - 1, false));
        }

        return { nodes: data.nodes, edges: new_edges };
    }

    function pushEdges(dist, curr, reverse) {
        let tmp_edges = [];
        while (dist[curr][0] !== 0) {
            let fm = dist[curr][1];
            tmp_edges.push({ arrows: { to: { enabled: true } }, from: reverse ? curr + 1 : fm + 1, to: reverse ? fm + 1 : curr + 1, color: 'orange', label: String(dist[curr][0] - dist[fm][0]) });
            curr = fm;
        }
        return tmp_edges;
    }

    genNew.click();
};

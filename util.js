var edge_width = 4;

function toggle_edge_state(edge_state, x, y, direction) {
  if (!edge_state[x]) {
    edge_state[x] = {};
  }
  if (!edge_state[x][y]) {
    edge_state[x][y] = 0;
  }
  edge_state[x][y] = edge_state[x][y] ^ direction;
}

function draw_single_edge(x1, y1, x2, y2, edge_margin, dark = false) {
  if (dark) {
    context.fillStyle = "#000000";
  } else {
    context.fillStyle = "#e0e0e0";
  }

  context.fillRect(
    (x1 * cell_size) - (edge_width * 0.5) + edge_margin,
    (y1 * cell_size) - (edge_width * 0.5) + edge_margin,
    ((x2 - x1) * cell_size) + edge_width,
    ((y2 - y1) * cell_size) + edge_width
  );
}

// The format for the keys in `dark_edges` is:
//   cell_x : cell_y 
// And the value is its direction
//
// The edge starts in the top left corner of the cell (cell_x, cell_y)
// The possible values for direction are:
// - 0: none (this is assumed if the key isn't present)
// - 1: horizontal (right) only
// - 2: vertical (down) only
// - 3: both horizontal and vertical
//
// Here's an example:
// 
// dark_edges = {
//   1: {
//     2: 1
//   },
//   2: {
//     1: 3
//   }
// }
// +  +  +  +
//
// +  +  +--+
//       |
// +  +--+  +
//
// +  +  +  +

function draw_grid(width, height, edge_margin = 0, dark_edges = {}) {
  for (var y = 0; y < height; y += 1) {
    for (var x = 0; x < width; x += 1) {
      var cell_dark_edges = 0;
      if (dark_edges[x] && dark_edges[x][y]) {
        cell_dark_edges = dark_edges[x][y];
      }

      if (cell_dark_edges == 0 || cell_dark_edges == 2) {
        draw_single_edge(x, y, x + 1, y, edge_margin);
      }
      if (cell_dark_edges == 0 || cell_dark_edges == 1) {
        draw_single_edge(x, y, x, y + 1, edge_margin);
      }
    }
  }

  for (x in dark_edges) {
    for (y in dark_edges[x]) {
      if (dark_edges[x][y] == 1 || dark_edges[x][y] == 3) {
        draw_single_edge(x, y, parseInt(x) + 1, y, edge_margin, true);
      } 
      if (dark_edges[x][y] == 2 || dark_edges[x][y] == 3) {
        draw_single_edge(x, y, x, parseInt(y) + 1, edge_margin, true);
      }
    }
  }

  draw_single_edge(0, 0, 0, height, edge_margin, true);
  draw_single_edge(0, 0, width, 0, edge_margin, true);
  draw_single_edge(0, height, width, height, edge_margin, true);
  draw_single_edge(width, 0, width, height, edge_margin, true);
}

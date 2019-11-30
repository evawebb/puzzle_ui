function edge_margin(grid_def_obj) {
  return (
    grid_def_obj.canvas_size /
    Math.max(
      grid_def_obj.grid_width,
      grid_def_obj.grid_height
    ) *
    grid_def_obj.edge_margin_multiplier
  );
}

function cell_width(grid_def_obj) {
  return (
    (
      grid_def_obj.canvas_size -
      2 * edge_margin(grid_def_obj)
    ) /
    grid_def_obj.grid_width
  );
}

function cell_height(grid_def_obj) {
  return (
    (
      grid_def_obj.canvas_size -
      2 * edge_margin(grid_def_obj)
    ) /
    grid_def_obj.grid_height
  );
}

function min_cell_size(grid_def_obj) {
  return Math.min(
    cell_width(grid_def_obj),
    cell_height(grid_def_obj)
  );
}

function set_edge_state(edge_state, x, y, direction, dark) {
  if (!edge_state[x]) {
    edge_state[x] = {};
  } 
  if (!edge_state[x][y]) {
    edge_state[x][y] = 0;
  }
  if (dark) {
    edge_state[x][y] = edge_state[x][y] | direction;
  } else {
    edge_state[x][y] = (edge_state[x][y] | direction) - direction;
  }
}

function toggle_edge_state(edge_state, x, y, direction) {
  if (!edge_state[x]) {
    edge_state[x] = {};
  }
  if (!edge_state[x][y]) {
    edge_state[x][y] = 0;
  }
  edge_state[x][y] = edge_state[x][y] ^ direction;
}

function draw_single_edge(x1, y1, x2, y2, grid_def_obj, dark = false) {
  if (dark) {
    context.fillStyle = "#000000";
  } else {
    context.fillStyle = "#e0e0e0";
  }

  context.fillRect(
    (x1 * min_cell_size(grid_def_obj)) - (grid_def_obj.edge_width * 0.5) + edge_margin(grid_def_obj),
    (y1 * min_cell_size(grid_def_obj)) - (grid_def_obj.edge_width * 0.5) + edge_margin(grid_def_obj),
    ((x2 - x1) * min_cell_size(grid_def_obj)) + grid_def_obj.edge_width,
    ((y2 - y1) * min_cell_size(grid_def_obj)) + grid_def_obj.edge_width
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

function draw_grid(grid_def_obj, dark_edges = {}) {
  for (var y = 0; y < grid_def_obj.grid_height; y += 1) {
    for (var x = 0; x < grid_def_obj.grid_width; x += 1) {
      var cell_dark_edges = 0;
      if (dark_edges[x] && dark_edges[x][y]) {
        cell_dark_edges = dark_edges[x][y];
      }

      if (cell_dark_edges == 0 || cell_dark_edges == 2) {
        draw_single_edge(x, y, x + 1, y, grid_def_obj);
      }
      if (cell_dark_edges == 0 || cell_dark_edges == 1) {
        draw_single_edge(x, y, x, y + 1, grid_def_obj);
      }
    }
  }

  for (x in dark_edges) {
    if (x >= 0 && x < grid_def_obj.grid_width) {
      for (y in dark_edges[x]) {
        if (y >= 0 && y < grid_def_obj.grid_height) {
          if (dark_edges[x][y] == 1 || dark_edges[x][y] == 3) {
            draw_single_edge(x, y, parseInt(x) + 1, y, grid_def_obj, true);
          } 
          if (dark_edges[x][y] == 2 || dark_edges[x][y] == 3) {
            draw_single_edge(x, y, x, parseInt(y) + 1, grid_def_obj, true);
          }
        }
      }
    }
  }

  draw_single_edge(0, 0, 0, grid_def_obj.grid_height, grid_def_obj, true);
  draw_single_edge(0, 0, grid_def_obj.grid_width, 0, grid_def_obj, true);
  draw_single_edge(0, grid_def_obj.grid_height, grid_def_obj.grid_width, grid_def_obj.grid_height, grid_def_obj, true);
  draw_single_edge(grid_def_obj.grid_width, 0, grid_def_obj.grid_width, grid_def_obj.grid_height, grid_def_obj, true);
}

function draw_selection(grid_def_obj, selection_obj) {
  context.fillStyle = "#a0ffa0";
  for (var i = 0; i < selection_obj.cells.length; i += 1) {
    context.fillRect(
      selection.cells[i][0] * min_cell_size(grid_def_obj) + edge_margin(grid_def_obj),
      selection.cells[i][1] * min_cell_size(grid_def_obj) + edge_margin(grid_def_obj),
      min_cell_size(grid_def_obj),
      min_cell_size(grid_def_obj)
    );
  }
}

function block_select_mousedown(event, grid_def_obj, selection_obj, render_fn) {
  selection_obj.down = true;
  var x = Math.floor((event.pageX - canvas.offsetLeft - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
  var y = Math.floor((event.pageY - canvas.offsetTop - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
  if (
    x >= 0 &&
    x < grid_def_obj.grid_width &&
    y >= 0 &&
    y < grid_def_obj.grid_height
  ) {
    selection_obj.cells = [[x, y]];
  }

  render_fn();
}

function block_select_mousemove(event, grid_def_obj, selection_obj, render_fn) {
  if (selection_obj.down) {
    var x = Math.floor((event.pageX - canvas.offsetLeft - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
    var y = Math.floor((event.pageY - canvas.offsetTop - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
    if (
      x >= 0 &&
      x < grid_def_obj.grid_width &&
      y >= 0 &&
      y < grid_def_obj.grid_height &&
      selection_obj.cells.filter(function(p) { 
        return p[0] == x && p[1] == y; 
      }).length == 0
    ) {
      selection_obj.cells.push([x, y]);
    }

    render_fn();
  }
}

function block_select_mouseup(event, grid_def_obj, selection_obj, render_fn) {
  selection_obj.down = false;

  render_fn();
}

function single_select_mousedown(event, grid_def_obj, selection_obj, render_fn) {
  selection_obj.down = true;
  var x = Math.floor((event.pageX - canvas.offsetLeft - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
  var y = Math.floor((event.pageY - canvas.offsetTop - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
  if (
    x >= 0 &&
    x < grid_def_obj.grid_width &&
    y >= 0 &&
    y < grid_def_obj.grid_height
  ) {
    selection_obj.cells = [[x, y]];
  }

  render_fn();
}

function single_select_mousemove(event, grid_def_obj, selection_obj, render_fn) {
  if (selection_obj.down) {
    var x = Math.floor((event.pageX - canvas.offsetLeft - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
    var y = Math.floor((event.pageY - canvas.offsetTop - edge_margin(grid_def_obj)) / min_cell_size(grid_def_obj));
    if (
      x >= 0 &&
      x < grid_def_obj.grid_width &&
      y >= 0 &&
      y < grid_def_obj.grid_height &&
      selection_obj.cells.filter(function(p) { 
        return p[0] == x && p[1] == y; 
      }).length == 0
    ) {
      selection_obj.cells = [[x, y]];
    }

    render_fn();
  }
}

function single_select_mouseup(event, grid_def_obj, selection_obj, render_fn) {
  selection_obj.down = false;

  render_fn();
}

// The state_objs parameter should be in the following format:
// [
//   ...,
//   {
//     obj: <a row-major 2d array>,
//     default: <the default value to insert in all the new cells>
//   },
//   ...
// ]

function expand_grid(event, grid_def_obj, state_objs, render_fn) {
  if (event.key == "h" || event.key == "j" || event.key == "k" || event.key == "l") {
    if (event.key == "h") {
      grid_def_obj.grid_width -= 1;
    } else if (event.key == "j") {
      grid_def_obj.grid_height += 1;
    } else if (event.key == "k") {
      grid_def_obj.grid_height -= 1;
    } else if (event.key == "l") {
      grid_def_obj.grid_width += 1;
    }

    for (var i = 0; i < state_objs.length; i += 1) {
      var so = state_objs[i];

      while (so.obj.length < grid_def_obj.grid_height) {
        var new_row = [];
        for (var j = 0; j < grid_def_obj.grid_width; j += 1) {
          new_row.push(so.default);
        }
        so.obj.push(new_row);
      }

      for (var j = 0; j < grid_def_obj.grid_height; j += 1) {
        while (so.obj[j].length < grid_def_obj.grid_width) {
          so.obj[j].push(so.default);
        }
      }
    }

    render_fn();
  }
}

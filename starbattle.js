var canvas;
var context;

var grid_def = {
  canvas_size: 1000,
  grid_width: 9,
  grid_height: 9,
  edge_margin_multiplier: 0.2,
  edge_width: 4
};

var selection = {
  cells: [],
  down: false
}

var state = [];
var edges = {};

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_def.grid_height; y += 1) {
    var state_row = [];
    for (var x = 0; x < grid_def.grid_width; x += 1) {
      state_row.push("");
    }
    state.push(state_row);
  }

  canvas.addEventListener("mousedown", function(event) {
    block_select_mousedown(event, grid_def, selection, render);
  });
  canvas.addEventListener("mousemove", function(event) {
    block_select_mousemove(event, grid_def, selection, render);
  });
  canvas.addEventListener("mouseup", function(event) {
    block_select_mouseup(event, grid_def, selection, render);
  });
  document.addEventListener("keydown", on_key);

  render();
}

function on_key(event) {
  expand_grid(
    event,
    grid_def,
    [{
      obj: state,
      default: ""
    }],
    render
  );

  var deltas = [[-1, 0], [0, -1], [0, 1], [1, 0]];
  if (selection.cells.length > 0) { 
    var selected_cells_lookup = {};
    for (var i = 0; i < selection.cells.length; i += 1) {
      if (!selected_cells_lookup[selection.cells[i][0]]) {
        selected_cells_lookup[selection.cells[i][0]] = {};
      }
      selected_cells_lookup[selection.cells[i][0]][selection.cells[i][1]] = true;
    }

    for (var i = 0; i < selection.cells.length; i += 1) {
      var x = selection.cells[i][0];
      var y = selection.cells[i][1];
      if (event.key == "g") {
        for (var j = 0; j < 4; j += 1) {
          var d = deltas[j];
          var dx = x + d[0];
          var dy = y + d[1];
          if (!(selected_cells_lookup[dx] && selected_cells_lookup[dx][dy])) {
            if (j == 0) {
              set_edge_state(edges, x, y, 2, true);
            } else if (j == 1) {
              set_edge_state(edges, x, y, 1, true);
            } else if (j == 2) {
              set_edge_state(edges, x, y + 1, 1, true);
            } else if (j == 3) {
              set_edge_state(edges, x + 1, y, 2, true);
            }
          }
        }
      } else if (event.key == " ") {
        if (state[y][x] == "") {
          state[y][x] = "n";
        } else if (state[y][x] == "n") {
          state[y][x] = "s";
        } else if (state[y][x] == "s") {
          state[y][x] = "";
        }
      }
    }
  }

  render();
}

function render() {
  context.clearRect(0, 0, grid_def.canvas_size, grid_def.canvas_size);

  draw_selection(grid_def, selection);
  draw_grid(grid_def, edges);
  draw_marks();
}

function draw_marks() {
  for (var y = 0; y < grid_def.grid_height; y += 1) {
    for (var x = 0; x < grid_def.grid_width; x += 1) {
      context.fillStyle = "#000000";
      if (state[y][x] == "n") {
        context.beginPath();
        context.arc(
          x * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
          y * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
          (min_cell_size(grid_def) - 4 * edge_margin(grid_def)) / 2,
          0,
          2 * Math.PI,
          false
        );
        context.fill();
      } else if (state[y][x] == "s") {
        context.fillRect(
          x * min_cell_size(grid_def) + 2 * edge_margin(grid_def),
          y * min_cell_size(grid_def) + 2 * edge_margin(grid_def),
          min_cell_size(grid_def) - 2 * edge_margin(grid_def),
          min_cell_size(grid_def) - 2 * edge_margin(grid_def)
        );
      }
    }
  }
}

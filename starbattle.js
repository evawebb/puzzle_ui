var starbattle_grid_def = {
  canvas_size: master_canvas_size,
  grid_width: 10,
  grid_height: 10,
  edge_margin_multiplier: 0.2,
  edge_width: 4
};

var starbattle_selection = {
  cells: [],
  down: false
}

var starbattle_state = {
  grid: [],
  history: []
};

var starbattle_edges = {};

function starbattle_setup() {
  init_state(starbattle_state, starbattle_grid_def, "");

  canvas.addEventListener("mousedown", function(event) {
    block_select_mousedown(event, starbattle_grid_def, starbattle_selection, starbattle_render);
  });
  canvas.addEventListener("mousemove", function(event) {
    block_select_mousemove(event, starbattle_grid_def, starbattle_selection, starbattle_render);
  });
  canvas.addEventListener("mouseup", function(event) {
    block_select_mouseup(event, starbattle_grid_def, starbattle_selection, starbattle_render);
  });
  document.addEventListener("keydown", starbattle_on_key);

  starbattle_render();
}

function starbattle_on_key(event) {
  expand_grid(
    event,
    starbattle_grid_def,
    [{
      obj: starbattle_state.grid,
      default: ""
    }],
    starbattle_render
  );

  if (starbattle_selection.cells.length == 1 && event.key == "ArrowUp" && starbattle_selection.cells[0][1] > 0) {
    starbattle_selection.cells[0][1] -= 1;
  } else if (starbattle_selection.cells.length == 1 && event.key == "ArrowDown" && starbattle_selection.cells[0][1] < starbattle_grid_def.grid_height - 1) {
    starbattle_selection.cells[0][1] += 1;
  } else if (starbattle_selection.cells.length == 1 && event.key == "ArrowLeft" && starbattle_selection.cells[0][0] > 0) {
    starbattle_selection.cells[0][0] -= 1;
  } else if (starbattle_selection.cells.length == 1 && event.key == "ArrowRight" && starbattle_selection.cells[0][0] < starbattle_grid_def.grid_width - 1) {
    starbattle_selection.cells[0][0] += 1;
  } else if (event.key == "u") {
    undo(starbattle_state);
  } else if (starbattle_selection.cells.length > 0) { 
    var selected_cells_lookup = {};
    for (var i = 0; i < starbattle_selection.cells.length; i += 1) {
      if (!selected_cells_lookup[starbattle_selection.cells[i][0]]) {
        selected_cells_lookup[starbattle_selection.cells[i][0]] = {};
      }
      selected_cells_lookup[starbattle_selection.cells[i][0]][starbattle_selection.cells[i][1]] = true;
    }

    var deltas = [[-1, 0], [0, -1], [0, 1], [1, 0]];
    if (event.key == "g") {
      for (var i = 0; i < starbattle_selection.cells.length; i += 1) {
        var x = starbattle_selection.cells[i][0];
        var y = starbattle_selection.cells[i][1];
        for (var j = 0; j < 4; j += 1) {
          var d = deltas[j];
          var dx = x + d[0];
          var dy = y + d[1];
          if (!(selected_cells_lookup[dx] && selected_cells_lookup[dx][dy])) {
            if (j == 0) {
              set_edge_state(starbattle_edges, x, y, 2, true);
            } else if (j == 1) {
              set_edge_state(starbattle_edges, x, y, 1, true);
            } else if (j == 2) {
              set_edge_state(starbattle_edges, x, y + 1, 1, true);
            } else if (j == 3) {
              set_edge_state(starbattle_edges, x + 1, y, 2, true);
            }
          }
        }
      }
    } else if (event.key == " ") {
      var first_coord = starbattle_selection.cells[0];
      var first_value = starbattle_state.grid[first_coord[1]][first_coord[0]];
      var next_value = "";
      if (first_value == "") {
        next_value = "n";
      } else if (first_value == "n") {
        next_value = "s";
      }

      set_state(
        starbattle_state,
        starbattle_selection.cells,
        next_value
      );
    }
  }

  starbattle_render();
}

function starbattle_render() {
  context.clearRect(0, 0, starbattle_grid_def.canvas_size, starbattle_grid_def.canvas_size);

  draw_selection(starbattle_grid_def, starbattle_selection);
  draw_grid(starbattle_grid_def, starbattle_edges);
  starbattle_draw_marks();
}

function starbattle_draw_marks() {
  for (var y = 0; y < starbattle_grid_def.grid_height; y += 1) {
    for (var x = 0; x < starbattle_grid_def.grid_width; x += 1) {
      context.fillStyle = "#000000";
      if (starbattle_state.grid[y][x] == "n") {
        context.beginPath();
        context.arc(
          x * min_cell_size(starbattle_grid_def) + min_cell_size(starbattle_grid_def) / 2 + edge_margin(starbattle_grid_def),
          y * min_cell_size(starbattle_grid_def) + min_cell_size(starbattle_grid_def) / 2 + edge_margin(starbattle_grid_def),
          (min_cell_size(starbattle_grid_def) - 4 * edge_margin(starbattle_grid_def)) / 2,
          0,
          2 * Math.PI,
          false
        );
        context.fill();
      } else if (starbattle_state.grid[y][x] == "s") {
        context.fillRect(
          x * min_cell_size(starbattle_grid_def) + 2 * edge_margin(starbattle_grid_def),
          y * min_cell_size(starbattle_grid_def) + 2 * edge_margin(starbattle_grid_def),
          min_cell_size(starbattle_grid_def) - 2 * edge_margin(starbattle_grid_def),
          min_cell_size(starbattle_grid_def) - 2 * edge_margin(starbattle_grid_def)
        );
      }
    }
  }
}

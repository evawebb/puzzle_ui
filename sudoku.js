var sudoku_grid_def = {
  canvas_size: master_canvas_size,
  grid_width: 9,
  grid_height: 9,
  edge_margin_multiplier: 0.2,
  edge_width: 4
};

var sudoku_selection = {
  cells: [],
  down: false
};

var sudoku_state = [];
var sudoku_locks = [];
var sudoku_notes = [];
var sudoku_edges = {};

function sudoku_setup() {
  for (var y = 0; y < sudoku_grid_def.grid_height; y += 1) {
    var state_row = [];
    var lock_row = []
    var note_row = [];
    for (var x = 0; x < sudoku_grid_def.grid_width; x += 1) {
      state_row.push([]);
      lock_row.push(false);
      note_row.push(false);

      if (y == 3 || y == 6) {
        toggle_edge_state(sudoku_edges, x, y, 1);
      }
      if (x == 3 || x == 6) {
        toggle_edge_state(sudoku_edges, x, y, 2);
      }
    }
    sudoku_state.push(state_row);
    sudoku_locks.push(lock_row);
    sudoku_notes.push(note_row);
  }

  canvas.addEventListener("mousedown", function(event) {
    block_select_mousedown(event, sudoku_grid_def, sudoku_selection, sudoku_render);
  });
  canvas.addEventListener("mousemove", function(event) {
    block_select_mousemove(event, sudoku_grid_def, sudoku_selection, sudoku_render);
  });
  canvas.addEventListener("mouseup", function(event) {
    block_select_mouseup(event, sudoku_grid_def, sudoku_selection, sudoku_render);
  });
  document.addEventListener("keydown", sudoku_on_key);

  sudoku_render();
}

function sudoku_on_key(event) {
  if (sudoku_selection.cells.length > 0 && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete"].includes(event.key)) {
    for (var i = 0; i < sudoku_selection.cells.length; i += 1) {
      if (!sudoku_locks[sudoku_selection.cells[i][1]][sudoku_selection.cells[i][0]]) {
        var cell = sudoku_state[sudoku_selection.cells[i][1]][sudoku_selection.cells[i][0]]
        if (event.key == "Delete") {
          cell.splice(0, cell.length);
        } else {
          if (cell.includes(event.key)) {
            cell.splice(cell.indexOf(event.key), 1);
          } else {
            cell.push(event.key);
          }
        }
      }
    } 
  } else if (sudoku_selection.cells.length == 1 && event.key == "ArrowUp" && sudoku_selection.cells[0][1] > 0) {
    sudoku_selection.cells[0][1] -= 1;
  } else if (sudoku_selection.cells.length == 1 && event.key == "ArrowDown" && sudoku_selection.cells[0][1] < sudoku_grid_def.grid_height - 1) {
    sudoku_selection.cells[0][1] += 1;
  } else if (sudoku_selection.cells.length == 1 && event.key == "ArrowLeft" && sudoku_selection.cells[0][0] > 0) {
    sudoku_selection.cells[0][0] -= 1;
  } else if (sudoku_selection.cells.length == 1 && event.key == "ArrowRight" && sudoku_selection.cells[0][0] < sudoku_grid_def.grid_width - 1) {
    sudoku_selection.cells[0][0] += 1;
  } else if (sudoku_selection.cells.length > 0 && event.key == "n") {
    for (var i = 0; i < sudoku_selection.cells.length; i += 1) {
      sudoku_notes[sudoku_selection.cells[i][1]][sudoku_selection.cells[i][0]] = !sudoku_notes[sudoku_selection.cells[i][1]][sudoku_selection.cells[i][0]]
    }
  }

  sudoku_render();
}

function sudoku_render() {
  context.clearRect(0, 0, sudoku_grid_def.canvas_size, sudoku_grid_def.canvas_size);

  draw_selection(sudoku_grid_def, sudoku_selection);
  draw_grid(sudoku_grid_def, sudoku_edges);
  sudoku_draw_numbers();
}

function sudoku_draw_highlight() {
  for (var i = 0; i < sudoku_selection.cells.length; i += 1) {
    context.fillStyle = "#a0ffa0";
    context.fillRect(
      sudoku_selection.cells[i][0] * cell_width(sudoku_grid_def) + edge_margin(sudoku_grid_def),
      sudoku_selection.cells[i][1] * cell_height(sudoku_grid_def) + edge_margin(sudoku_grid_def),
      cell_width(sudoku_grid_def),
      cell_height(sudoku_grid_def)
    );
  }
}

function sudoku_draw_numbers() {
  for (var x = 0; x < sudoku_grid_def.grid_width; x += 1) {
    for (var y = 0; y < sudoku_grid_def.grid_height; y += 1) {
      var cell = sudoku_state[y][x];
      if (cell.length > 0) {
        var font_size = null;
        var text = null;

        // Format the text appropriately
        if (cell.length == 1) {
          text = cell;
        } else if (1 < cell.length && cell.length <= 5) {
          text = [cell.sort().join("")];
        } else if (5 < cell.length) {
          text = [
            cell.sort().slice(0, 5).join(""),
            cell.sort().slice(5).join("")
          ];
        }

        // Set the font size 
        if (cell.length == 1 && !sudoku_notes[y][x]) {
          context.font = "" + Math.floor(cell_height(sudoku_grid_def) * 0.8) + "px serif";
        } else {
          context.font = "" + Math.floor(cell_height(sudoku_grid_def) * 0.4) + "px serif";
        }

        // Set the text color
        context.fillStyle = "#000000";

        // Set the text alignment
        if (!sudoku_notes[y][x]) {
          context.textAlign = "center";
          context.textBaseline = "middle";
        } else {
          context.textAlign = "left";
          context.textBaseline = "top";
        }

        // Draw the text
        for (var i = 0; i < text.length; i += 1) {
          if (!sudoku_notes[y][x]) {
            context.fillText(
              text[i],
              (x + 0.5) * cell_width(sudoku_grid_def) + edge_margin(sudoku_grid_def),
              (y + ((i + 1) / (text.length + 1))) * cell_height(sudoku_grid_def) + edge_margin(sudoku_grid_def)
            );
          } else {
            context.fillText(
              text[i],
              (x + 0.02) * cell_width(sudoku_grid_def) + edge_margin(sudoku_grid_def),
              (y + (i / 3) + 0.02) * cell_height(sudoku_grid_def) + edge_margin(sudoku_grid_def)
            );
          }
        }
      }
    }
  }
}

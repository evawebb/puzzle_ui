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
};

var state = [];
var locks = [];
var notes = [];
var mouse_is_down = false;
var selected = [];
var edges = {};

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_def.grid_height; y += 1) {
    var state_row = [];
    var lock_row = []
    var note_row = [];
    for (var x = 0; x < grid_def.grid_width; x += 1) {
      state_row.push([]);
      lock_row.push(false);
      note_row.push(false);

      if (y == 3 || y == 6) {
        toggle_edge_state(edges, x, y, 1);
      }
      if (x == 3 || x == 6) {
        toggle_edge_state(edges, x, y, 2);
      }
    }
    state.push(state_row);
    locks.push(lock_row);
    notes.push(note_row);
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
  if (selection.cells.length > 0 && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete"].includes(event.key)) {
    for (var i = 0; i < selection.cells.length; i += 1) {
      if (!locks[selection.cells[i][1]][selection.cells[i][0]]) {
        var cell = state[selection.cells[i][1]][selection.cells[i][0]]
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
  } else if (selection.cells.length == 1 && event.key == "ArrowUp" && selection.cells[0][1] > 0) {
    selection.cells[0][1] -= 1;
  } else if (selection.cells.length == 1 && event.key == "ArrowDown" && selection.cells[0][1] < grid_def.grid_height - 1) {
    selection.cells[0][1] += 1;
  } else if (selection.cells.length == 1 && event.key == "ArrowLeft" && selection.cells[0][0] > 0) {
    selection.cells[0][0] -= 1;
  } else if (selection.cells.length == 1 && event.key == "ArrowRight" && selection.cells[0][0] < grid_def.grid_width - 1) {
    selection.cells[0][0] += 1;
  } else if (selection.cells.length > 0 && event.key == "n") {
    for (var i = 0; i < selection.cells.length; i += 1) {
      notes[selection.cells[i][1]][selection.cells[i][0]] = !notes[selection.cells[i][1]][selection.cells[i][0]]
    }
  }

  render();
}

function render() {
  context.clearRect(0, 0, grid_def.canvas_size, grid_def.canvas_size);

  draw_selection(grid_def, selection);
  draw_grid(grid_def, edges);
  draw_numbers();
}

function draw_highlight() {
  for (var i = 0; i < selection.cells.length; i += 1) {
    context.fillStyle = "#a0ffa0";
    context.fillRect(
      selection.cells[i][0] * cell_width(grid_def) + edge_margin(grid_def),
      selection.cells[i][1] * cell_height(grid_def) + edge_margin(grid_def),
      cell_width(grid_def),
      cell_height(grid_def)
    );
  }
}

function draw_numbers() {
  for (var x = 0; x < grid_def.grid_width; x += 1) {
    for (var y = 0; y < grid_def.grid_height; y += 1) {
      var cell = state[y][x];
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
        if (cell.length == 1 && !notes[y][x]) {
          context.font = "" + Math.floor(cell_height(grid_def) * 0.8) + "px serif";
        } else {
          context.font = "" + Math.floor(cell_height(grid_def) * 0.4) + "px serif";
        }

        // Set the text color
        context.fillStyle = "#000000";

        // Set the text alignment
        if (!notes[y][x]) {
          context.textAlign = "center";
          context.textBaseline = "middle";
        } else {
          context.textAlign = "left";
          context.textBaseline = "top";
        }

        // Draw the text
        for (var i = 0; i < text.length; i += 1) {
          if (!notes[y][x]) {
            context.fillText(
              text[i],
              (x + 0.5) * cell_width(grid_def) + edge_margin(grid_def),
              (y + ((i + 1) / (text.length + 1))) * cell_height(grid_def) + edge_margin(grid_def)
            );
          } else {
            context.fillText(
              text[i],
              (x + 0.02) * cell_width(grid_def) + edge_margin(grid_def),
              (y + (i / 3) + 0.02) * cell_height(grid_def) + edge_margin(grid_def)
            );
          }
        }
      }
    }
  }
}

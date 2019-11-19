var canvas;
var context;
var canvas_size = 1000;
var grid_size = 9;
var edge_margin_multiplier = 0.2;
var edge_margin = canvas_size / grid_size * edge_margin_multiplier;
var cell_size = (canvas_size - 2 * edge_margin) / grid_size;
var state = [];
var locks = [];
var notes = [];
var mouse_is_down = false;
var selected = [];
var setting = false;
var edges = {};

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_size; y += 1) {
    var state_row = [];
    var lock_row = []
    var note_row = [];
    for (var x = 0; x < grid_size; x += 1) {
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

  canvas.addEventListener("mousedown", on_mousedown);
  canvas.addEventListener("mouseup", on_mouseup);
  canvas.addEventListener("mousemove", on_mousemove);
  document.addEventListener("keydown", on_key);

  render();
}

function on_mousedown(event) {
  mouse_is_down = true;
  var x = Math.floor((event.pageX - canvas.offsetLeft) / cell_size);
  var y = Math.floor((event.pageY - canvas.offsetTop) / cell_size);
  selected = [[x, y]];

  render();
}

function on_mouseup(event) {
  mouse_is_down = false;

  render();
}

function on_mousemove(event) {
  if (mouse_is_down) {
    var x = Math.floor((event.pageX - canvas.offsetLeft) / cell_size);
    var y = Math.floor((event.pageY - canvas.offsetTop) / cell_size);
    if (selected.filter(function(p) { return p[0] == x && p[1] == y; }).length == 0) {
      selected.push([x, y]);
    }
  }

  render();
}

// single-number notes?

function on_key(event) {
  if (selected.length > 0 && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete"].includes(event.key)) {
    if (setting) {
      for (var i = 0; i < selected.length; i += 1) {
        if (event.key == "Delete") {
          state[selected[i][1]][selected[i][0]] = [];
          locks[selected[i][1]][selected[i][0]] = false;
        } else {
          state[selected[i][1]][selected[i][0]] = [event.key];
          locks[selected[i][1]][selected[i][0]] = true;
        }
      }
    } else {
      for (var i = 0; i < selected.length; i += 1) {
        if (!locks[selected[i][1]][selected[i][0]]) {
          var cell = state[selected[i][1]][selected[i][0]]
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
    }
  } else if (selected.length == 1 && event.key == "ArrowUp" && selected[0][1] > 0) {
    selected[0][1] -= 1;
  } else if (selected.length == 1 && event.key == "ArrowDown" && selected[0][1] < grid_size - 1) {
    selected[0][1] += 1;
  } else if (selected.length == 1 && event.key == "ArrowLeft" && selected[0][0] > 0) {
    selected[0][0] -= 1;
  } else if (selected.length == 1 && event.key == "ArrowRight" && selected[0][0] < grid_size - 1) {
    selected[0][0] += 1;
  } else if (event.key == "s") {
    setting = !setting;
  } else if (selected.length > 0 && event.key == "n") {
    for (var i = 0; i < selected.length; i += 1) {
      notes[selected[i][1]][selected[i][0]] = !notes[selected[i][1]][selected[i][0]]
    }
  }

  render();
}

function render() {
  context.clearRect(0, 0, canvas_size, canvas_size);
  draw_highlight();
  draw_grid(grid_size, grid_size, edge_margin, edges);
  draw_numbers();
}

function draw_highlight() {
  if (setting) {
    context.fillStyle = "#e8ffff";
    context.fillRect(0, 0, canvas_size, canvas_size);
  }
  for (var i = 0; i < selected.length; i += 1) {
    context.fillStyle = "#a0ffa0";
    context.fillRect(
      selected[i][0] * cell_size + edge_margin,
      selected[i][1] * cell_size + edge_margin,
      cell_size,
      cell_size
    );
  }
}

function draw_numbers() {
  for (var x = 0; x < grid_size; x += 1) {
    for (var y = 0; y < grid_size; y += 1) {
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
          context.font = "" + Math.floor(cell_size * 0.8) + "px serif";
        } else {
          context.font = "" + Math.floor(cell_size * 0.4) + "px serif";
        }

        // Set the text color
        if (!setting && locks[y][x]) {
          context.fillStyle = "#808080";
        } else {
          context.fillStyle = "#000000";
        }

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
              (x + 0.5) * cell_size + edge_margin,
              (y + ((i + 1) / (text.length + 1))) * cell_size + edge_margin
            );
          } else {
            context.fillText(
              text[i],
              (x + 0.02) * cell_size + edge_margin,
              (y + (i / 3) + 0.02) * cell_size + edge_margin
            );
          }
        }
      }
    }
  }
}

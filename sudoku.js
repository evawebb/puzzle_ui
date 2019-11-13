var canvas;
var context;
var canvas_size = 500;
var grid_size = 9;
var cell_size = canvas_size / grid_size;
var state = [];
var locks = [];
var mouse_is_down = false;
var selected = [];
var setting = false;

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_size; y += 1) {
    var state_row = [];
    var lock_row = []
    for (var x = 0; x < grid_size; x += 1) {
      state_row.push([]);
      lock_row.push(false);
    }
    state.push(state_row);
    locks.push(lock_row);
  }

  canvas.addEventListener("mousedown", on_mousedown);
  canvas.addEventListener("mouseup", on_mouseup);
  canvas.addEventListener("mousemove", on_mousemove);
  document.addEventListener("keydown", on_key);

  render();
}

// why is there a delay for single clicks?

function on_mousedown(event) {
  mouse_is_down = true;
  var x = Math.floor((event.pageX - canvas.offsetLeft) / cell_size);
  var y = Math.floor((event.pageY - canvas.offsetTop) / cell_size);
  selected = [[x, y]];
}

function on_mouseup(event) {
  mouse_is_down = false;
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
  } if (selected.length == 1 && event.key == "ArrowUp" && selected[i][1] > 0) {
    selected[0][1] -= 1;
  } else if (selected.length == 1 && event.key == "ArrowDown" && selected[i][1] < grid_size - 1) {
    selected[0][1] += 1;
  } else if (selected.length == 1 && event.key == "ArrowLeft" && selected[i][0] > 0) {
    selected[0][0] -= 1;
  } else if (selected.length == 1 && event.key == "ArrowRight" && selected[i][0] < grid_size - 1) {
    selected[0][0] += 1;
  } else if (event.key == "s") {
    setting = !setting;
  }

  render();
}

function render() {
  context.clearRect(0, 0, canvas_size, canvas_size);
  draw_highlight();
  draw_grid();
  draw_numbers();
}

function draw_highlight() {
  if (setting) {
    context.fillStyle = "#e0e0ff";
    context.fillRect(0, 0, canvas_size, canvas_size);
  }
  for (var i = 0; i < selected.length; i += 1) {
    context.fillStyle = "#a0ffa0";
    context.fillRect(
      selected[i][0] * cell_size,
      selected[i][1] * cell_size,
      cell_size,
      cell_size
    );
  }
}

function draw_grid() {
  context.strokeStyle = "#c0c0c0";
  context.beginPath();
  for (var x = 0; x < grid_size; x += 1) {
    for (var y = 0; y < grid_size; y += 1) {
      context.moveTo(
        x * cell_size,
        y * cell_size
      );
      context.lineTo(
        (x + 1) * cell_size - 1,
        y * cell_size
      );
      context.lineTo(
        (x + 1) * cell_size - 1,
        (y + 1) * cell_size - 1
      );
      context.lineTo(
        x * cell_size,
        (y + 1) * cell_size - 1
      );
      context.lineTo(
        x * cell_size,
        y * cell_size
      );
    }
  }
  context.stroke();

  context.strokeStyle = "#000000";
  context.beginPath();
  var region_size = cell_size * 3;
  for (var x = 0; x < grid_size / 3; x += 1) {
    for (var y = 0; y < grid_size / 3; y += 1) {
      context.moveTo(
        x * region_size,
        y * region_size
      );
      context.lineTo(
        (x + 1) * region_size - 1,
        y * region_size
      );
      context.lineTo(
        (x + 1) * region_size - 1,
        (y + 1) * region_size - 1
      );
      context.lineTo(
        x * region_size,
        (y + 1) * region_size - 1
      );
      context.lineTo(
        x * region_size,
        y * region_size
      );
    }
  }
  context.stroke();
}

function draw_numbers() {
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (var x = 0; x < grid_size; x += 1) {
    for (var y = 0; y < grid_size; y += 1) {
      var cell = state[y][x];
      var font_size = null;
      var text = null;

      if (cell.length == 1) {
        font_size = Math.floor(cell_size * 0.8);
        text = cell;
      } else if (1 < cell.length && cell.length <= 5) {
        font_size = Math.floor(cell_size * 0.4);
        text = [cell.sort().join("")];
      } else if (5 < cell.length) {
        font_size = Math.floor(cell_size * 0.4);
        text = [
          cell.sort().slice(0, 5).join(""),
          cell.sort().slice(5).join("")
        ];
      }

      if (font_size && text) {
        if (!setting && locks[y][x]) {
          context.fillStyle = "#808080";
        } else {
          context.fillStyle = "#000000";
        }
        context.font = "" + font_size + "px serif";
        for (var i = 0; i < text.length; i += 1) {
          context.fillText(
            text[i],
            (x + 0.5) * cell_size,
            (y + ((i + 1) / (text.length + 1))) * cell_size
          );
        }
      }
    }
  }
}

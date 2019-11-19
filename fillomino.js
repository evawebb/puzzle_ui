var canvas;
var context;
var canvas_size = 1000;
var grid_width = 10;
var grid_height = 10;
var edge_margin_multiplier = 0.2;
var edge_margin = canvas_size / Math.max(grid_width, grid_height) * edge_margin_multiplier;
var cell_size = (canvas_size - 2 * edge_margin) / Math.max(grid_width, grid_height);
var edge_width = 4;

var cell_state = [];
var edge_state = {};

var selected = null;

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_height; y += 1) {
    var cell_row = [];
    for (var x = 0; x < grid_width; x += 1) {
      cell_row.push("");
    }
    cell_state.push(cell_row);
  }

  canvas.addEventListener("mouseup", on_mouseup);
  document.addEventListener("keydown", on_key);
  render();
}

// TODO: why does cell->edge seem to trigger too far out?

// TODO: the overlap between edge regions is awkward

// TODO: sometimes the selector doesn't go away when leaving the board

// TODO: undo

function on_mouseup(event) {
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  var cell_x = Math.floor((x - edge_margin) / cell_size);
  var cell_y = Math.floor((y - edge_margin) / cell_size);
  selected = [cell_x, cell_y];

  render();
}

function toggle_edge_state(x, y, direction) {
  if (!edge_state[x]) {
    edge_state[x] = {};
  }
  if (!edge_state[x][y]) {
    edge_state[x][y] = 0;
  }
  edge_state[x][y] = edge_state[x][y] ^ direction;
}

function on_key(event) {
  if (event.key == "h" || event.key == "j" || event.key == "k" || event.key == "l") {
    // Expand the grid
    if (event.key == "h") {
      grid_width -= 1;
    } else if (event.key == "j") {
      grid_height += 1;
    } else if (event.key == "k") {
      grid_height -= 1;
    } else if (event.key == "l") {
      grid_width += 1;
    }
    cell_size = (canvas_size - 2 * edge_margin) / Math.max(grid_width, grid_height);

    // Grow the cell state if needed
    while (cell_state.length < grid_height) {
      var cell_row = [];
      for (var x = 0; x < grid_width; x += 1) {
        cell_row.push("");
      }
      cell_state.push(cell_row);
    }
    for (var y = 0; y < grid_height; y += 1) {
      while (cell_state[y].length < grid_width) {
        cell_state[y].push("");
      }
    }
  } else if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x"].includes(event.key) && selected) {
    if (event.key == "Delete" || event.key == "x") {
      cell_state[selected[1]][selected[0]] = "";
    } else {
      cell_state[selected[1]][selected[0]] = event.key;
    }
  } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && selected) {
    if (event.key == "ArrowUp" && selected[1] > 0) {
      selected[1] -= 1;
    } else if (event.key == "ArrowDown" && selected[1] < grid_height - 1) {
      selected[1] += 1;
    } else if (event.key == "ArrowLeft" && selected[0] > 0) {
      selected[0] -= 1;
    } else if (event.key == "ArrowRight" && selected[0] < grid_width - 1) {
      selected[0] += 1;
    }
  } else if (["w", "a", "s", "d"].includes(event.key) && selected) {
    if (event.key == "w" && selected[1] > 0) {
      toggle_edge_state(selected[0], selected[1], 1);
    } else if (event.key == "a" && selected[0] > 0) {
      toggle_edge_state(selected[0], selected[1], 2);
    } else if (event.key == "s" && selected[1] < grid_height - 1) {
      toggle_edge_state(selected[0], selected[1] + 1, 1);
    } else if (event.key == "d" && selected[0] < grid_width - 1) {
      toggle_edge_state(selected[0] + 1, selected[1], 2);
    }
  }

  render();
}

function render() {
  context.clearRect(0, 0, canvas_size, canvas_size);
  draw_selected();
  draw_grid(grid_width, grid_height, edge_state);
  draw_numbers();
}

function draw_selected() {
  if (selected) {
    context.fillStyle = "rgba(0, 255, 0, 0.5)";
    context.fillRect(
      selected[0] * cell_size + edge_margin,
      selected[1] * cell_size + edge_margin,
      cell_size,
      cell_size
    );
  }
}

function draw_numbers() {
  context.font = "" + Math.floor(cell_size * 0.8) + "px serif";
  context.fillStyle = "#000000";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (var y = 0; y < grid_height; y += 1) {
    for (var x = 0; x < grid_width; x += 1) {
      context.fillText(
        cell_state[y][x],
        ((x + 0.5) * cell_size) + edge_margin,
        ((y + 0.5) * cell_size) + edge_margin
      );
    }
  }
}


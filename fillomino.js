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
var edge_state = {
  "h": [],
  "v": []
};

var mouse_pos = null;
var mouse_mode = null;
var mouse_state_pos = null;
var selected = null;

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_height; y += 1) {
    var cell_row = [];
    var edge_h_row = [];
    var edge_v_row = [];
    for (var x = 0; x < grid_width; x += 1) {
      cell_row.push("");
      edge_h_row.push(false);
      if (x < grid_width - 1) {
        edge_v_row.push(false);
      }
    }
    cell_state.push(cell_row);
    if (y < grid_height - 1) {
      edge_state["h"].push(edge_h_row);
    }
    edge_state["v"].push(edge_v_row);
  }

  canvas.addEventListener("mousemove", on_mousemove);
  canvas.addEventListener("mouseup", on_mouseup);
  document.addEventListener("keydown", on_key);
  render();
}

// TODO: why does cell->edge seem to trigger too far out?

// TODO: the overlap between edge regions is awkward

// TODO: sometimes the selector doesn't go away when leaving the board

// TODO: undo

function on_mousemove(event) {
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  mouse_pos = [x, y];

  var inv_edge_margin = cell_size - edge_margin;

  var cell_x = Math.floor((mouse_pos[0] - edge_margin) / cell_size);
  var cell_y = Math.floor((mouse_pos[1] - edge_margin) / cell_size);
  var cell_x_remainder = Math.abs((mouse_pos[0] - edge_margin) % cell_size);
  var cell_y_remainder = Math.abs((mouse_pos[1] - edge_margin) % cell_size);

  if (cell_x >= 0 && cell_x < grid_width && cell_y >= 0 && cell_y < grid_height) {
    if (
      cell_x_remainder <= edge_margin &&
      edge_margin < cell_y_remainder && cell_y_remainder < inv_edge_margin
    ) {
      mouse_mode = "edge";
      mouse_state_pos = ["v", cell_x - 1, cell_y];
    } else if (
      cell_x_remainder >= inv_edge_margin &&
      edge_margin < cell_y_remainder && cell_y_remainder < inv_edge_margin
    ) {
      mouse_mode = "edge";
      mouse_state_pos = ["v", cell_x, cell_y];
    } else if (
      edge_margin < cell_x_remainder && cell_x_remainder < inv_edge_margin &&
      cell_y_remainder <= edge_margin
    ) {
      mouse_mode = "edge";
      mouse_state_pos = ["h", cell_x, cell_y - 1];
    } else if (
      edge_margin < cell_x_remainder && cell_x_remainder < inv_edge_margin &&
      cell_y_remainder >= inv_edge_margin
    ) {
      mouse_mode = "edge";
      mouse_state_pos = ["h", cell_x, cell_y];
    } else if (
      edge_margin < cell_x_remainder && cell_x_remainder < inv_edge_margin &&
      edge_margin < cell_y_remainder && cell_y_remainder < inv_edge_margin
    ) {
      mouse_mode = "cell";
      mouse_state_pos = [cell_x, cell_y];
    }
  } else {
    mouse_mode = null;
    mouse_state_pos = null;
  }

  // I think adding this guard here is easier than making the if-else logic
  // above any more complicated
  if (
    mouse_mode == "edge" && 
    (
      mouse_state_pos[2] < 0 ||
      edge_state[mouse_state_pos[0]].length <= mouse_state_pos[2] ||
      mouse_state_pos[1] < 0 ||
      edge_state[mouse_state_pos[0]][mouse_state_pos[2]].length <= mouse_state_pos[1]
    )
  ) {
    mouse_mode = null;
    mouse_state_mode = null;
  }

  render();
}

function on_mouseup(event) {
  if (mouse_mode == "edge") {
    selected = null;
    edge_state[mouse_state_pos[0]][mouse_state_pos[2]][mouse_state_pos[1]] = !edge_state[mouse_state_pos[0]][mouse_state_pos[2]][mouse_state_pos[1]];
  } else if (mouse_mode == "cell") {
    selected = mouse_state_pos;
  }

  render();
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

    // Grow the horizontal edge state if needed
    while (edge_state["h"].length < grid_height - 1) {
      var edge_h_row = [];
      for (var x = 0; x < grid_width; x += 1) {
        edge_h_row.push(false);
      }
      edge_state["h"].push(edge_h_row);
    }
    for (var y = 0; y < grid_height - 1; y += 1) {
      while (edge_state["h"][y].length < grid_width) {
        edge_state["h"][y].push(false);
      }
    }

    // Grow the vertical edge state if needed
    while (edge_state["v"].length < grid_height) {
      var edge_v_row = [];
      for (var x = 0; x < grid_width - 1; x += 1) {
        edge_v_row.push(false);
      }
      edge_state["v"].push(edge_v_row);
    }
    for (var y = 0; y < grid_height; y += 1) {
      while (edge_state["v"][y].length < grid_width - 1) {
        edge_state["v"][y].push(false);
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
      edge_state["h"][selected[1] - 1][selected[0]] = !edge_state["h"][selected[1] - 1][selected[0]];
    } else if (event.key == "a" && selected[0] > 0) {
      edge_state["v"][selected[1]][selected[0] - 1] = !edge_state["v"][selected[1]][selected[0] - 1];
    } else if (event.key == "s" && selected[1] < grid_height - 1) {
      edge_state["h"][selected[1]][selected[0]] = !edge_state["h"][selected[1]][selected[0]];
    } else if (event.key == "d" && selected[0] < grid_width - 1) {
      edge_state["v"][selected[1]][selected[0]] = !edge_state["v"][selected[1]][selected[0]];
    }
  }

  render();
}

function render() {
  context.clearRect(0, 0, canvas_size, canvas_size);
  draw_selected();
  draw_grid();
  draw_numbers();
  draw_selector();
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

function draw_single_edge(x1, y1, x2, y2, dark = false) {
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

function draw_grid() {
  for (var y = 0; y < grid_height - 1; y += 1) {
    for (var x = 0; x < grid_width; x += 1) {
      if (!edge_state["h"][y][x]) {
        draw_single_edge(x, y + 1, x + 1, y + 1, false);
      }
    }
  }

  for (var y = 0; y < grid_height; y += 1) {
    for (var x = 0; x < grid_width - 1; x += 1) {
      if (!edge_state["v"][y][x]) {
        draw_single_edge(x + 1, y, x + 1, y + 1, false);
      }
    }
  }

  for (var y = 0; y < grid_height - 1; y += 1) {
    for (var x = 0; x < grid_width; x += 1) {
      if (edge_state["h"][y][x]) {
        draw_single_edge(x, y + 1, x + 1, y + 1, true);
      }
    }
  }

  for (var y = 0; y < grid_height; y += 1) {
    for (var x = 0; x < grid_width - 1; x += 1) {
      if (edge_state["v"][y][x]) {
        draw_single_edge(x + 1, y, x + 1, y + 1, true);
      }
    }
  }

  draw_single_edge(0, 0, 0, grid_height, true);
  draw_single_edge(0, 0, grid_width, 0, true);
  draw_single_edge(0, grid_height, grid_width, grid_height, true);
  draw_single_edge(grid_width, 0, grid_width, grid_height, true);
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

function draw_selector() {
  if (mouse_pos && mouse_mode && mouse_state_pos) {
    context.fillStyle = "rgba(128, 128, 128, 0.5)";
    context.beginPath();

    var x = null;
    var y = null;
    var rx = null;
    var ry = null;

    if (mouse_mode == "edge") {
      if (mouse_state_pos[0] == "h") {
        x = (mouse_state_pos[1] + 0.5) * cell_size + edge_margin;
        y = (mouse_state_pos[2] + 1) * cell_size + edge_margin;
        rx = (cell_size - edge_margin) * 0.5;
        ry = edge_margin * 0.5;
      } else if (mouse_state_pos[0] == "v") {
        x = (mouse_state_pos[1] + 1) * cell_size + edge_margin;
        y = (mouse_state_pos[2] + 0.5) * cell_size + edge_margin;
        rx = edge_margin * 0.5;
        ry = (cell_size - edge_margin) * 0.5;
      }
    } else if (mouse_mode == "cell") {
      x = (mouse_state_pos[0] + 0.5) * cell_size + edge_margin;
      y = (mouse_state_pos[1] + 0.5) * cell_size + edge_margin;
      rx = (cell_size - edge_margin) * 0.5;
      ry = (cell_size - edge_margin) * 0.5;
    }

    context.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI);
    context.fill();
  }
}

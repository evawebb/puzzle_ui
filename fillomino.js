var fillomino_grid_def = {
  canvas_size: master_canvas_size,
  grid_width: 10,
  grid_height: 10,
  edge_margin_multiplier: 0.2,
  edge_width: 4
};

var fillomino_cell_state = [];
var fillomino_edge_state = {};

var fillomino_selected = null;

function fillomino_setup() {
  for (var y = 0; y < fillomino_grid_def.grid_height; y += 1) {
    var cell_row = [];
    for (var x = 0; x < fillomino_grid_def.grid_width; x += 1) {
      cell_row.push("");
    }
    fillomino_cell_state.push(cell_row);
  }

  canvas.addEventListener("mouseup", fillomino_on_mouseup);
  document.addEventListener("keydown", fillomino_on_key);
  fillomino_render();
}

function fillomino_on_mouseup(event) {
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  var cell_x = Math.floor((x - edge_margin(fillomino_grid_def)) / min_cell_size(fillomino_grid_def));
  var cell_y = Math.floor((y - edge_margin(fillomino_grid_def)) / min_cell_size(fillomino_grid_def));
  fillomino_selected = [cell_x, cell_y];

  fillomino_render();
}

function fillomino_on_key(event) {
  expand_grid(
    event,
    fillomino_grid_def,
    [{
      obj: fillomino_cell_state,
      default: ""
    }],
    fillomino_render
  );

  if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x", "t", "T"].includes(event.key) && fillomino_selected) {
    if (event.key == "Delete" || event.key == "x") {
      fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]] = "";
    } else if (event.key == "t") {
      if (fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]] == "") {
        fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]] = "10";
      } else {
        fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]] = 10 + parseInt(fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]]);
      }
    } else if (event.key == "T") {
      if (parseInt(fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]]) == 10) {
        fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]] = "";
      } else if (parseInt(fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]]) > 10) {
        fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]] = parseInt(fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]]) - 10;
      }
    } else {
      fillomino_cell_state[fillomino_selected[1]][fillomino_selected[0]] = event.key;
    }
  } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && fillomino_selected) {
    if (event.key == "ArrowUp" && fillomino_selected[1] > 0) {
      fillomino_selected[1] -= 1;
    } else if (event.key == "ArrowDown" && fillomino_selected[1] < fillomino_grid_def.grid_height - 1) {
      fillomino_selected[1] += 1;
    } else if (event.key == "ArrowLeft" && fillomino_selected[0] > 0) {
      fillomino_selected[0] -= 1;
    } else if (event.key == "ArrowRight" && fillomino_selected[0] < fillomino_grid_def.grid_width - 1) {
      fillomino_selected[0] += 1;
    }
  } else if (["w", "a", "s", "d"].includes(event.key) && fillomino_selected) {
    if (event.key == "w" && fillomino_selected[1] > 0) {
      toggle_edge_state(fillomino_edge_state, fillomino_selected[0], fillomino_selected[1], 1);
    } else if (event.key == "a" && fillomino_selected[0] > 0) {
      toggle_edge_state(fillomino_edge_state, fillomino_selected[0], fillomino_selected[1], 2);
    } else if (event.key == "s" && fillomino_selected[1] < fillomino_grid_def.grid_height - 1) {
      toggle_edge_state(fillomino_edge_state, fillomino_selected[0], fillomino_selected[1] + 1, 1);
    } else if (event.key == "d" && fillomino_selected[0] < fillomino_grid_def.grid_width - 1) {
      toggle_edge_state(fillomino_edge_state, fillomino_selected[0] + 1, fillomino_selected[1], 2);
    }
  }

  fillomino_render();
}

function fillomino_render() {
  context.clearRect(0, 0, fillomino_grid_def.canvas_size, fillomino_grid_def.canvas_size);
  fillomino_draw_fillomino_selected();
  draw_grid(fillomino_grid_def, fillomino_edge_state);
  fillomino_draw_numbers();
}

function fillomino_draw_fillomino_selected() {
  if (fillomino_selected) {
    context.fillStyle = "rgba(0, 255, 0, 0.5)";
    context.fillRect(
      fillomino_selected[0] * min_cell_size(fillomino_grid_def) + edge_margin(fillomino_grid_def),
      fillomino_selected[1] * min_cell_size(fillomino_grid_def) + edge_margin(fillomino_grid_def),
      min_cell_size(fillomino_grid_def),
      min_cell_size(fillomino_grid_def)
    );
  }
}

function fillomino_draw_numbers() {
  context.font = "" + Math.floor(min_cell_size(fillomino_grid_def) * 0.8) + "px serif";
  context.fillStyle = "#000000";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (var y = 0; y < fillomino_grid_def.grid_height; y += 1) {
    for (var x = 0; x < fillomino_grid_def.grid_width; x += 1) {
      context.fillText(
        fillomino_cell_state[y][x],
        ((x + 0.5) * min_cell_size(fillomino_grid_def)) + edge_margin(fillomino_grid_def),
        ((y + 0.5) * min_cell_size(fillomino_grid_def)) + edge_margin(fillomino_grid_def)
      );
    }
  }
}


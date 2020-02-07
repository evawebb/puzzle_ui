var masyu_grid_def = {
  canvas_size: master_canvas_size,
  grid_width: 10,
  grid_height: 10,
  edge_margin_multiplier: 0.2,
  edge_width: 4
};

var masyu_selection = {
  cells: [],
  down: false
};

var masyu_state = [];
var masyu_paths = [];
var masyu_path_start = null;

function masyu_setup() {
  for (var y = 0; y < masyu_grid_def.grid_height; y += 1) {
    var row = [];
    for (var x = 0; x < masyu_grid_def.grid_width; x += 1) {
      row.push("e");
    }
    masyu_state.push(row);
  }

  canvas.addEventListener("mousedown", function(event) {
    single_select_mousedown(event, masyu_grid_def, masyu_selection, masyu_render);
  });
  canvas.addEventListener("mousemove", function(event) {
    single_select_mousemove(event, masyu_grid_def, masyu_selection, masyu_render);
  });
  canvas.addEventListener("mouseup", function(event) {
    single_select_mouseup(event, masyu_grid_def, masyu_selection, masyu_render);

    var x = masyu_selection.cells[0][0];
    var y = masyu_selection.cells[0][1];
    if (event.shiftKey) {
      if (masyu_state[y][x] == "e") {
        masyu_state[y][x] = "b";
      } else if (masyu_state[y][x] == "b") {
        masyu_state[y][x] = "w";
      } else if (masyu_state[y][x] == "w") {
        masyu_state[y][x] = "e";
      }
    } else {
      if (masyu_path_start) {
        if (x == masyu_path_start[0] && y != masyu_path_start[1]) {
          if (y < masyu_path_start[1]) {
            masyu_paths.push([[x, y], masyu_path_start]);
          } else {
            masyu_paths.push([masyu_path_start, [x, y]]);
          }
        } else if (x != masyu_path_start[0] && y == masyu_path_start[1]) {
          if (x < masyu_path_start[0]) {
            masyu_paths.push([[x, y], masyu_path_start]);
          } else {
            masyu_paths.push([masyu_path_start, [x, y]]);
          }
        }
        masyu_path_start = null;
      } else {
        masyu_path_start = [x, y];
      }
    }

    masyu_render();
  });
  document.addEventListener("keypress", masyu_on_key);

  masyu_render();
}

function masyu_on_key(event) {
  expand_grid(
    event,
    masyu_grid_def,
    [{
      obj: masyu_state,
      default: "e"
    }],
    masyu_render
  );

  if (event.key == "u" || event.key == "U") {
    masyu_paths.pop();
  }

  masyu_render();
}

function masyu_render() {
  context.clearRect(0, 0, masyu_grid_def.canvas_size, masyu_grid_def.canvas_size);

  draw_grid(masyu_grid_def);
  masyu_draw_circles();
  masyu_draw_paths();
}

function masyu_draw_circles() {
  context.strokeStyle = "#000000";
  context.fillStyle = "#000000";
  for (var x = 0; x < masyu_grid_def.grid_width; x += 1) {
    for (var y = 0; y < masyu_grid_def.grid_height; y += 1) {
      if (masyu_state[y][x] != "e") {
        context.beginPath();
        context.arc(
          x * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def), 
          y * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def),
          min_cell_size(masyu_grid_def) / 2 - min_cell_size(masyu_grid_def) * 0.1,
          0,
          2 * Math.PI,
          false
        );
        if (masyu_state[y][x] == "b") {
          context.fill();
        } else if (masyu_state[y][x] == "w") {
          context.stroke();
        }
      }
    }
  }
}

function masyu_draw_paths() {
  if (masyu_path_start) {
    context.fillStyle = "rgba(255, 0, 0, 0.5)";
    context.fillRect(
      masyu_path_start[0] * min_cell_size(masyu_grid_def) + edge_margin(masyu_grid_def),
      masyu_path_start[1] * min_cell_size(masyu_grid_def) + edge_margin(masyu_grid_def),
      min_cell_size(masyu_grid_def),
      min_cell_size(masyu_grid_def)
    );
  }

  context.fillStyle = "#ff0000";
  for (var i = 0; i < masyu_paths.length; i += 1) {
    context.beginPath();
    context.arc(
      masyu_paths[i][0][0] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def),
      masyu_paths[i][0][1] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def),
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    context.beginPath();
    context.arc(
      masyu_paths[i][1][0] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def),
      masyu_paths[i][1][1] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def),
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    if (masyu_paths[i][0][0] == masyu_paths[i][1][0]) {
      context.fillRect(
        masyu_paths[i][0][0] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 - 5 + edge_margin(masyu_grid_def),
        masyu_paths[i][0][1] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def),
        10,
        (masyu_paths[i][1][1] - masyu_paths[i][0][1]) * min_cell_size(masyu_grid_def)
      );
    } else if (masyu_paths[i][0][1] == masyu_paths[i][1][1]) {
      context.fillRect(
        masyu_paths[i][0][0] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 + edge_margin(masyu_grid_def),
        masyu_paths[i][0][1] * min_cell_size(masyu_grid_def) + min_cell_size(masyu_grid_def) / 2 - 5 + edge_margin(masyu_grid_def),
        (masyu_paths[i][1][0] - masyu_paths[i][0][0]) * min_cell_size(masyu_grid_def),
        10
      );
    }
  }
}

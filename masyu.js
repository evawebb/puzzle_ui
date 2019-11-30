var canvas;
var context;

var grid_def = {
  canvas_size: 1000,
  grid_width: 10,
  grid_height: 10,
  edge_margin_multiplier: 0.2,
  edge_width: 4
};

var selection = {
  cells: [],
  down: false
};

var state = [];
var paths = [];
var path_start = null;

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_def.grid_height; y += 1) {
    var row = [];
    for (var x = 0; x < grid_def.grid_width; x += 1) {
      row.push("e");
    }
    state.push(row);
  }

  canvas.addEventListener("mousedown", function(event) {
    single_select_mousedown(event, grid_def, selection, render);
  });
  canvas.addEventListener("mousemove", function(event) {
    single_select_mousemove(event, grid_def, selection, render);
  });
  canvas.addEventListener("mouseup", function(event) {
    single_select_mouseup(event, grid_def, selection, render);

    var x = selection.cells[0][0];
    var y = selection.cells[0][1];
    if (event.shiftKey) {
      if (state[y][x] == "e") {
        state[y][x] = "b";
      } else if (state[y][x] == "b") {
        state[y][x] = "w";
      } else if (state[y][x] == "w") {
        state[y][x] = "e";
      }
    } else {
      if (path_start) {
        if (x == path_start[0] && y != path_start[1]) {
          if (y < path_start[1]) {
            paths.push([[x, y], path_start]);
          } else {
            paths.push([path_start, [x, y]]);
          }
        } else if (x != path_start[0] && y == path_start[1]) {
          if (x < path_start[0]) {
            paths.push([[x, y], path_start]);
          } else {
            paths.push([path_start, [x, y]]);
          }
        }
        path_start = null;
      } else {
        path_start = [x, y];
      }
    }

    render();
  });
  document.addEventListener("keypress", on_key);

  render();
}

function on_key(event) {
  expand_grid(
    event,
    grid_def,
    [{
      obj: state,
      default: "e"
    }],
    render
  );

  if (event.key == "u" || event.key == "U") {
    paths.pop();
  }

  render();
}

function render() {
  context.clearRect(0, 0, grid_def.canvas_size, grid_def.canvas_size);

  draw_grid(grid_def);
  draw_circles();
  draw_paths();
}

function draw_circles() {
  context.strokeStyle = "#000000";
  context.fillStyle = "#000000";
  for (var x = 0; x < grid_def.grid_width; x += 1) {
    for (var y = 0; y < grid_def.grid_height; y += 1) {
      if (state[y][x] != "e") {
        context.beginPath();
        context.arc(
          x * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def), 
          y * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
          min_cell_size(grid_def) / 2 - min_cell_size(grid_def) * 0.1,
          0,
          2 * Math.PI,
          false
        );
        if (state[y][x] == "b") {
          context.fill();
        } else if (state[y][x] == "w") {
          context.stroke();
        }
      }
    }
  }
}

function draw_paths() {
  if (path_start) {
    context.fillStyle = "rgba(255, 0, 0, 0.5)";
    context.fillRect(
      path_start[0] * min_cell_size(grid_def) + edge_margin(grid_def),
      path_start[1] * min_cell_size(grid_def) + edge_margin(grid_def),
      min_cell_size(grid_def),
      min_cell_size(grid_def)
    );
  }

  context.fillStyle = "#ff0000";
  for (var i = 0; i < paths.length; i += 1) {
    context.beginPath();
    context.arc(
      paths[i][0][0] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
      paths[i][0][1] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    context.beginPath();
    context.arc(
      paths[i][1][0] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
      paths[i][1][1] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    if (paths[i][0][0] == paths[i][1][0]) {
      context.fillRect(
        paths[i][0][0] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 - 5 + edge_margin(grid_def),
        paths[i][0][1] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
        10,
        (paths[i][1][1] - paths[i][0][1]) * min_cell_size(grid_def)
      );
    } else if (paths[i][0][1] == paths[i][1][1]) {
      context.fillRect(
        paths[i][0][0] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 + edge_margin(grid_def),
        paths[i][0][1] * min_cell_size(grid_def) + min_cell_size(grid_def) / 2 - 5 + edge_margin(grid_def),
        (paths[i][1][0] - paths[i][0][0]) * min_cell_size(grid_def),
        10
      );
    }
  }
}

var canvas;
var context;
var state = [];
var path_start = null;
var paths = [];
var canvas_size = 1000;
var grid_width = 10;
var grid_height = 10;
var cell_size = canvas_size / Math.max(grid_width, grid_height);

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < grid_height; y += 1) {
    var row = [];
    for (var x = 0; x < grid_width; x += 1) {
      row.push("e");
    }
    state.push(row);
  }

  canvas.addEventListener("click", on_click);
  document.addEventListener("keypress", on_key);

  render();
}

function on_click(event) {
  var x = Math.floor((event.pageX - canvas.offsetLeft) / cell_size);
  var y = Math.floor((event.pageY - canvas.offsetTop) / cell_size);

  if (x >= 0 && x < grid_width && y >= 0 && y < grid_height) {
    var setting = event.shiftKey;
    if (setting) {
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
  }
}

function on_key(event) {
  if (event.key == "h" || event.key == "j" || event.key == "k" || event.key == "l") {
    if (event.key == "h") {
      grid_width -= 1;
    } else if (event.key == "j") {
      grid_height += 1;
    } else if (event.key == "k") {
      grid_height -= 1;
    } else if (event.key == "l") {
      grid_width += 1;
    }
    cell_size = canvas_size / Math.max(grid_width, grid_height);

    if (state.length < grid_height) {
      var new_row = []
      for (var i = 0; i < grid_width; i += 1) {
        new_row.push("e");
      }
      state.push(new_row);
    }

    for (var i = 0; i < grid_height; i += 1) {
      while (state[i].length < grid_width) {
        state[i].push("e");
      }
    }
  } else if (event.key == "u" || event.key == "U") {
    paths.pop();
  }

  render();
}

function render() {
  context.clearRect(0, 0, canvas_size, canvas_size);
  draw_grid(context);
  draw_circles(context);
  draw_paths(context);
}

function draw_grid(context) {
  context.strokeStyle = "#000000";
  context.beginPath();
  for (var x = 0; x < grid_width; x += 1) {
    for (var y = 0; y < grid_height; y += 1) {
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
}

function draw_circles(context) {
  context.strokeStyle = "#000000";
  context.fillStyle = "#000000";
  for (var x = 0; x < grid_width; x += 1) {
    for (var y = 0; y < grid_height; y += 1) {
      if (state[y][x] != "e") {
        context.beginPath();
        context.arc(
          x * cell_size + cell_size / 2, 
          y * cell_size + cell_size / 2,
          cell_size / 2 - cell_size * 0.1,
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

function draw_paths(context) {
  if (path_start) {
    context.fillStyle = "rgba(255, 0, 0, 0.5)";
    context.fillRect(
      path_start[0] * cell_size,
      path_start[1] * cell_size,
      cell_size,
      cell_size
    );
  }

  context.fillStyle = "#ff0000";
  for (var i = 0; i < paths.length; i += 1) {
    context.beginPath();
    context.arc(
      paths[i][0][0] * cell_size + cell_size / 2,
      paths[i][0][1] * cell_size + cell_size / 2,
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    context.beginPath();
    context.arc(
      paths[i][1][0] * cell_size + cell_size / 2,
      paths[i][1][1] * cell_size + cell_size / 2,
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    if (paths[i][0][0] == paths[i][1][0]) {
      context.fillRect(
        paths[i][0][0] * cell_size + cell_size / 2 - 5,
        paths[i][0][1] * cell_size + cell_size / 2,
        10,
        (paths[i][1][1] - paths[i][0][1]) * cell_size
      );
    } else if (paths[i][0][1] == paths[i][1][1]) {
      context.fillRect(
        paths[i][0][0] * cell_size + cell_size / 2,
        paths[i][0][1] * cell_size + cell_size / 2 - 5,
        (paths[i][1][0] - paths[i][0][0]) * cell_size,
        10
      );
    }
  }
}

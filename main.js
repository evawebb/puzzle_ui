var canvas;
var context;
var state = [];
var path_start = null;
var paths = [];

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  for (var y = 0; y < 10; y += 1) {
    var row = [];
    for (var x = 0; x < 10; x += 1) {
      row.push("e");
    }
    state.push(row);
  }

  canvas.addEventListener("click", on_click);

  render();
}

function on_click(event) {
  var x = Math.floor((event.pageX - canvas.offsetLeft) / 50);
  var y = Math.floor((event.pageY - canvas.offsetTop) / 50);
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
      if (x == path_start[0]) {
        if (y < path_start[1]) {
          paths.push([[x, y], path_start]);
        } else {
          paths.push([path_start, [x, y]]);
        }
      } else if (y == path_start[1]) {
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

function render() {
  context.clearRect(0, 0, 500, 500);
  draw_grid(context);
  draw_circles(context);
  draw_paths(context);
}

function draw_grid(context) {
  context.strokeStyle = "#000000";
  context.beginPath();
  for (var x = 0; x < 10; x += 1) {
    for (var y = 0; y < 10; y += 1) {
      context.moveTo(
        x * 50,
        y * 50
      );
      context.lineTo(
        (x + 1) * 50 - 1,
        y * 50
      );
      context.lineTo(
        (x + 1) * 50 - 1,
        (y + 1) * 50 - 1
      );
      context.lineTo(
        x * 50,
        (y + 1) * 50 - 1
      );
      context.lineTo(
        x * 50,
        y * 50
      );
    }
  }
  context.stroke();
}

function draw_circles(context) {
  context.strokeStyle = "#000000";
  context.fillStyle = "#000000";
  for (var x = 0; x < 10; x += 1) {
    for (var y = 0; y < 10; y += 1) {
      if (state[y][x] != "e") {
        context.beginPath();
        context.arc(
          x * 50 + 25, 
          y * 50 + 25,
          20,
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
      path_start[0] * 50,
      path_start[1] * 50,
      50,
      50
    );
  }

  context.fillStyle = "#ff0000";
  for (var i = 0; i < paths.length; i += 1) {
    context.beginPath();
    context.arc(
      paths[i][0][0] * 50 + 25,
      paths[i][0][1] * 50 + 25,
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    context.beginPath();
    context.arc(
      paths[i][1][0] * 50 + 25,
      paths[i][1][1] * 50 + 25,
      5,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    console.log(paths[i][0][0], paths[i][0][1], paths[i][1][0], paths[i][1][1]);
    if (paths[i][0][0] == paths[i][1][0]) {
      context.fillRect(
        paths[i][0][0] * 50 + 20,
        paths[i][0][1] * 50 + 25,
        10,
        (paths[i][1][1] - paths[i][0][1]) * 50
      );
    } else if (paths[i][0][1] == paths[i][1][1]) {
      console.log(
        paths[i][0][0] * 50 + 25,
        paths[i][0][1] * 50 + 20,
        10,
        (paths[i][1][1] - paths[i][0][1]) * 50
      );
      context.fillRect(
        paths[i][0][0] * 50 + 25,
        paths[i][0][1] * 50 + 20,
        (paths[i][1][0] - paths[i][0][0]) * 50,
        10
      );
    }
    // context.fillRect(
    //   paths[i][0][0] * 50 + 20,
    //   paths[i][0][1] * 50 + 20,
    //   (paths[i][1][0] - paths[i][0][0]) * 50 + 10,
    //   (paths[i][1][1] - paths[i][0][1]) * 50 + 10
    // );
  }
}

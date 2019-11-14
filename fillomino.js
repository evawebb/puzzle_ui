var canvas;
var context;
var canvas_size = 1000;
var grid_width = 10;
var grid_height = 10;
var edge_margin_multiplier = 0.2;
var edge_margin = canvas_size / Math.max(grid_width, grid_height) * edge_margin_multiplier;
var cell_size = (canvas_size - 2 * edge_margin) / Math.max(grid_width, grid_height);
var mouse_pos = null;

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  canvas.addEventListener("mousemove", on_mousemove);
  document.addEventListener("keydown", on_key);
  render();
}

function on_mousemove(event) {
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  mouse_pos = [x, y];

  render();
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
    cell_size = (canvas_size - 2 * edge_margin) / Math.max(grid_width, grid_height);
  }

  render();
}

function render() {
  context.clearRect(0, 0, canvas_size, canvas_size);
  draw_grid();
  draw_selector();
}

function draw_grid() {
  context.strokeStyle = "#000000";
  context.beginPath();
  for (var x = 0; x < grid_width; x += 1) {
    for (var y = 0; y < grid_height; y += 1) {
      context.moveTo(
        x * cell_size + edge_margin,
        y * cell_size + edge_margin
      );
      context.lineTo(
        (x + 1) * cell_size - 1 + edge_margin,
        y * cell_size + edge_margin
      );
      context.lineTo(
        (x + 1) * cell_size - 1 + edge_margin,
        (y + 1) * cell_size - 1 + edge_margin
      );
      context.lineTo(
        x * cell_size + edge_margin,
        (y + 1) * cell_size - 1 + edge_margin
      );
      context.lineTo(
        x * cell_size + edge_margin,
        y * cell_size + edge_margin
      );
    }
  }
  context.stroke();
}

function draw_selector() {
  if (mouse_pos) {
    var cell_x = (mouse_pos[0] - edge_margin) / cell_size;
    var cell_y = (mouse_pos[1] - edge_margin) / cell_size;
    console.log(
      mouse_pos[0],
      mouse_pos[1],
      cell_x,
      cell_y
    );
  }
}

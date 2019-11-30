var canvas;
var context;

var grid_def = {
  canvas_size: 1000,
  grid_width: 10,
  grid_height: 10,
  edge_margin_multiplier: 0.2,
  edge_width: 4
};

var cell_state = [];
var edge_state = {};

var selected = null;

var puzzle_csv = null;
// puzzle_csv = "4,4,4,5,,,,,2,5,4,1,,,,,1,2,1,2\n,,,,,4,2,,,,,,,4,2,,,,,\n,,,,,4,4,,,,,,,1,6,,,,,\n1,2,3,5,,,,,3,3,1,3,,,,,6,4,3,1\n,,,,5,4,1,3,,,,,1,3,5,1,,,,\n,2,4,,,,,,,4,4,,,,,,,1,4,\n,1,4,,,,,,,1,2,,,,,,,5,4,\n,,,,7,7,1,2,,,,,8,1,8,1,,,,\n3,3,4,7,,,,,3,4,1,8,,,,,8,3,3,1\n,,,,,5,3,,,,,,,1,2,,,,,\n,,,,,4,4,,,,,,,5,2,,,,,\n5,5,2,7,,,,,4,4,3,2,,,,,2,8,8,3\n,,,,1,3,4,4,,,,,5,5,5,2,,,,\n,5,2,,,,,,,5,6,,,,,,,2,5,\n,1,5,,,,,,,3,4,,,,,,,1,5,\n,,,,5,5,6,2,,,,,6,1,6,3,,,,\n2,3,2,1,,,,,6,3,3,6,,,,,6,2,1,2\n,,,,,4,4,,,,,,,1,3,,,,,\n,,,,,6,4,,,,,,,3,2,,,,,\n4,4,3,3,,,,,3,2,1,3,,,,,5,5,3,1\n,,,,1,3,2,5,,,,,5,5,2,3,,,,\n,4,3,,,,,,,2,5,,,,,,,3,4,\n,2,1,,,,,,,5,2,,,,,,,6,6,\n,,,,6,6,2,7,,,,,1,2,1,6,,,,\n1,3,1,2,,,,,7,3,2,1,,,,,6,2,4,2\n,,,,,5,5,,,,,,,3,1,,,,,\n,,,,,4,4,,,,,,,8,8,,,,,\n4,4,3,1,,,,,8,3,1,4,,,,,4,2,6,1\n,,,,1,4,3,2,,,,,4,3,2,1,,,,\n,3,3,,,,,,,6,6,,,,,,,4,4,\n,1,4,,,,,,,5,3,,,,,,,4,6,\n,,,,1,2,3,5,,,,,4,4,2,5,,,,\n2,7,6,1,,,,,5,1,3,3,,,,,1,4,4,1\n,,,,,6,6,,,,,,,4,5,,,,,\n,,,,,3,3,,,,,,,2,1,,,,,\n7,2,7,1,,,,,4,3,6,2,,,,,3,3,1,2";
// puzzle_csv = ",,7,,,3,,,3,,,4,,,4,,,6,,\n1,,,7,,3,,6,,,,,4,,3,,6,,,1\n7,,,,4,3,4,,,,,,,4,5,4,,,,7\n7,,5,5,4,,4,2,4,,,5,5,5,,4,3,3,,7\n6,,,,6,6,2,,,,,,,6,6,6,,,,6\n,,,1,,5,,3,,,,,1,,6,,5,,,\n1,,1,,,1,,,6,,,1,,,5,,,7,,1\n7,,,,,,,,,,,,,,,,,,,7\n7,,7,,,5,,,3,,,3,,,3,,,3,,7\n6,,,7,,3,,6,,,,,2,,7,,6,,,6\n,,,,1,4,8,,,,,,,5,7,6,,,,\n1,,6,6,4,,4,2,8,,,1,6,1,,6,1,6,,1\n7,,,,3,3,2,,,,,,,3,6,1,,,,7\n7,,,6,,3,,4,,,,,5,,6,,1,,,7\n6,,2,,,4,,,4,,,3,,,5,,,7,,6\n,,,,,,,,,,,,,,,,,,,,\n1,,4,,,4,,,8,,,3,,,6,,,1,,1\n7,,,1,4,,,,,4,6,,,,,6,7,,,7\n7,,,3,6,,,,,8,3,,,,,6,7,,,7\n6,,7,,,8,,,3,,,4,,,2,,,7,,6\n,,,,,,,,,,,,,,,,,,,,\n1,,1,,,5,,,5,,,4,,,3,,,1,,1\n7,,,5,,5,,6,,,,,3,,4,,1,,,7\n7,,,,4,5,2,,,,,,,3,4,7,,,,7\n6,,7,6,4,,5,5,2,,,1,8,6,,7,3,6,,6\n,,,,7,4,8,,,,,,,6,4,1,,,,\n1,,,2,,4,,3,,,,,9,,4,,2,,,1\n7,,2,,,6,,,1,,,3,,,8,,,1,,7\n7,,,,,,,,,,,,,,,,,,,7\n6,,7,,,6,,,4,,,9,,,8,,,8,,6\n,,,2,,1,,4,,,,,3,,8,,6,,,\n1,,,,4,4,6,,,,,,,6,4,1,,,,1\n7,,1,7,4,,3,3,4,,,3,6,6,,4,2,2,,7\n7,,,,6,7,7,,,,,,,1,4,1,,,,7\n6,,,1,,5,,3,,,,,5,,2,,6,,,6\n,,1,,,3,,,7,,,5,,,1,,,1,,"

function setup() {
  canvas = document.getElementById("puzzle");
  context = canvas.getContext("2d");

  if (puzzle_csv) {
    var puzzle_from_csv = puzzle_csv.split("\n");
    for (var i = 0; i < puzzle_from_csv.length; i += 1) {
      puzzle_from_csv[i] = puzzle_from_csv[i].split(",");
    }

    grid_def.grid_height = puzzle_from_csv.length;
    grid_def.grid_width = puzzle_from_csv[0].length;
  }


  for (var y = 0; y < grid_def.grid_height; y += 1) {
    var cell_row = [];
    for (var x = 0; x < grid_def.grid_width; x += 1) {
      if (puzzle_csv) {
        cell_row.push(puzzle_from_csv[y][x]);
      } else {
        cell_row.push("");
      }
    }
    cell_state.push(cell_row);
  }

  canvas.addEventListener("mouseup", on_mouseup);
  document.addEventListener("keydown", on_key);
  render();
}

function on_mouseup(event) {
  var x = event.pageX - canvas.offsetLeft;
  var y = event.pageY - canvas.offsetTop;
  var cell_x = Math.floor((x - edge_margin(grid_def)) / min_cell_size(grid_def));
  var cell_y = Math.floor((y - edge_margin(grid_def)) / min_cell_size(grid_def));
  selected = [cell_x, cell_y];

  render();
}

function on_key(event) {
  expand_grid(
    event,
    grid_def,
    [{
      obj: cell_state,
      default: ""
    }],
    render
  );

  if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x", "t", "T"].includes(event.key) && selected) {
    if (event.key == "Delete" || event.key == "x") {
      cell_state[selected[1]][selected[0]] = "";
    } else if (event.key == "t") {
      if (cell_state[selected[1]][selected[0]] == "") {
        cell_state[selected[1]][selected[0]] = "10";
      } else {
        cell_state[selected[1]][selected[0]] = 10 + parseInt(cell_state[selected[1]][selected[0]]);
      }
    } else if (event.key == "T") {
      if (parseInt(cell_state[selected[1]][selected[0]]) == 10) {
        cell_state[selected[1]][selected[0]] = "";
      } else if (parseInt(cell_state[selected[1]][selected[0]]) > 10) {
        cell_state[selected[1]][selected[0]] = parseInt(cell_state[selected[1]][selected[0]]) - 10;
      }
    } else {
      cell_state[selected[1]][selected[0]] = event.key;
    }
  } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && selected) {
    if (event.key == "ArrowUp" && selected[1] > 0) {
      selected[1] -= 1;
    } else if (event.key == "ArrowDown" && selected[1] < grid_def.grid_height - 1) {
      selected[1] += 1;
    } else if (event.key == "ArrowLeft" && selected[0] > 0) {
      selected[0] -= 1;
    } else if (event.key == "ArrowRight" && selected[0] < grid_def.grid_width - 1) {
      selected[0] += 1;
    }
  } else if (["w", "a", "s", "d"].includes(event.key) && selected) {
    if (event.key == "w" && selected[1] > 0) {
      toggle_edge_state(edge_state, selected[0], selected[1], 1);
    } else if (event.key == "a" && selected[0] > 0) {
      toggle_edge_state(edge_state, selected[0], selected[1], 2);
    } else if (event.key == "s" && selected[1] < grid_def.grid_height - 1) {
      toggle_edge_state(edge_state, selected[0], selected[1] + 1, 1);
    } else if (event.key == "d" && selected[0] < grid_def.grid_width - 1) {
      toggle_edge_state(edge_state, selected[0] + 1, selected[1], 2);
    }
  }

  render();
}

function render() {
  context.clearRect(0, 0, grid_def.canvas_size, grid_def.canvas_size);
  draw_selected();
  draw_grid(grid_def, edge_state);
  draw_numbers();
}

function draw_selected() {
  if (selected) {
    context.fillStyle = "rgba(0, 255, 0, 0.5)";
    context.fillRect(
      selected[0] * min_cell_size(grid_def) + edge_margin(grid_def),
      selected[1] * min_cell_size(grid_def) + edge_margin(grid_def),
      min_cell_size(grid_def),
      min_cell_size(grid_def)
    );
  }
}

function draw_numbers() {
  context.font = "" + Math.floor(min_cell_size(grid_def) * 0.8) + "px serif";
  context.fillStyle = "#000000";
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (var y = 0; y < grid_def.grid_height; y += 1) {
    for (var x = 0; x < grid_def.grid_width; x += 1) {
      context.fillText(
        cell_state[y][x],
        ((x + 0.5) * min_cell_size(grid_def)) + edge_margin(grid_def),
        ((y + 0.5) * min_cell_size(grid_def)) + edge_margin(grid_def)
      );
    }
  }
}


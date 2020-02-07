class Masyu {
  constructor() {
    this.grid_def = {
      canvas_size: master_canvas_size,
      grid_width: 10,
      grid_height: 10,
      edge_margin_multiplier: 0.2,
      edge_width: 4
    };

    this.selection = {
      cells: [],
      down: false
    };

    this.state = [];
    this.paths = [];
    this.path_start = null;

    for (var y = 0; y < this.grid_def.grid_height; y += 1) {
      var row = [];
      for (var x = 0; x < this.grid_def.grid_width; x += 1) {
        row.push("e");
      }
      this.state.push(row);
    }

    canvas.addEventListener("mousedown", (function(event) {
      single_select_mousedown(event, this.grid_def, this.selection, this.render.bind(this));
    }).bind(this));
    canvas.addEventListener("mousemove", (function(event) {
      single_select_mousemove(event, this.grid_def, this.selection, this.render.bind(this));
    }).bind(this));
    canvas.addEventListener("mouseup", (function(event) {
      single_select_mouseup(event, this.grid_def, this.selection, this.render.bind(this));

      var x = this.selection.cells[0][0];
      var y = this.selection.cells[0][1];
      if (event.shiftKey) {
        if (this.state[y][x] == "e") {
          this.state[y][x] = "b";
        } else if (this.state[y][x] == "b") {
          this.state[y][x] = "w";
        } else if (this.state[y][x] == "w") {
          this.state[y][x] = "e";
        }
      } else {
        if (this.path_start) {
          if (x == this.path_start[0] && y != this.path_start[1]) {
            if (y < this.path_start[1]) {
              this.paths.push([[x, y], this.path_start]);
            } else {
              this.paths.push([this.path_start, [x, y]]);
            }
          } else if (x != this.path_start[0] && y == this.path_start[1]) {
            if (x < this.path_start[0]) {
              this.paths.push([[x, y], this.path_start]);
            } else {
              this.paths.push([this.path_start, [x, y]]);
            }
          }
          this.path_start = null;
        } else {
          this.path_start = [x, y];
        }
      }

      this.render();
    }).bind(this));
    document.addEventListener("keypress", this.on_key.bind(this));

    this.render();
  }

  on_key(event) {
    expand_grid(
      event,
      this.grid_def,
      [{
        obj: this.state,
        default: "e"
      }],
      this.render
    );

    if (event.key == "u" || event.key == "U") {
      this.paths.pop();
    }

    this.render();
  }

  render() {
    context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);

    draw_grid(this.grid_def);
    this.draw_circles();
    this.draw_paths();
  }

  draw_circles() {
    context.strokeStyle = "#000000";
    context.fillStyle = "#000000";
    for (var x = 0; x < this.grid_def.grid_width; x += 1) {
      for (var y = 0; y < this.grid_def.grid_height; y += 1) {
        if (this.state[y][x] != "e") {
          context.beginPath();
          context.arc(
            x * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def), 
            y * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
            min_cell_size(this.grid_def) / 2 - min_cell_size(this.grid_def) * 0.1,
            0,
            2 * Math.PI,
            false
          );
          if (this.state[y][x] == "b") {
            context.fill();
          } else if (this.state[y][x] == "w") {
            context.stroke();
          }
        }
      }
    }
  }

  draw_paths() {
    if (this.path_start) {
      context.fillStyle = "rgba(255, 0, 0, 0.5)";
      context.fillRect(
        this.path_start[0] * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
        this.path_start[1] * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
        min_cell_size(this.grid_def),
        min_cell_size(this.grid_def)
      );
    }

    context.fillStyle = "#ff0000";
    for (var i = 0; i < this.paths.length; i += 1) {
      context.beginPath();
      context.arc(
        this.paths[i][0][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
        this.paths[i][0][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
        5,
        0,
        2 * Math.PI,
        false
      );
      context.fill();
      context.beginPath();
      context.arc(
        this.paths[i][1][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
        this.paths[i][1][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
        5,
        0,
        2 * Math.PI,
        false
      );
      context.fill();
      if (this.paths[i][0][0] == this.paths[i][1][0]) {
        context.fillRect(
          this.paths[i][0][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 - 5 + edge_margin(this.grid_def),
          this.paths[i][0][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
          10,
          (this.paths[i][1][1] - this.paths[i][0][1]) * min_cell_size(this.grid_def)
        );
      } else if (this.paths[i][0][1] == this.paths[i][1][1]) {
        context.fillRect(
          this.paths[i][0][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
          this.paths[i][0][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 - 5 + edge_margin(this.grid_def),
          (this.paths[i][1][0] - this.paths[i][0][0]) * min_cell_size(this.grid_def),
          10
        );
      }
    }
  }
}

class Fillomino {
  constructor() {
    this.grid_def = {
      canvas_size: master_canvas_size,
      grid_width: 10,
      grid_height: 10,
      edge_margin_multiplier: 0.2,
      edge_width: 4
    };
    this.state = {
      grid: [],
      edges: {},
      history: []
    };
    this.selection = {
      cells: [],
      down: false
    };

    init_state(this.state, this.grid_def, "");

    canvas.addEventListener("mousedown", (function(event) {
      single_select_mousedown(event, this.grid_def, this.selection, this.render.bind(this));
    }).bind(this));
    canvas.addEventListener("mousemove", (function(event) {
      single_select_mousemove(event, this.grid_def, this.selection, this.render.bind(this));
    }).bind(this));
    canvas.addEventListener("mouseup", (function(event) {
      single_select_mouseup(event, this.grid_def, this.selection, this.render.bind(this));
    }).bind(this));
    document.addEventListener("keydown", this.on_key.bind(this));
    this.render();
  }

  on_key(event) {
    expand_grid(
      event,
      this.grid_def,
      [{
        obj: this.state.grid,
        default: ""
      }],
      this.render.bind(this)
    );

    const sc = this.selection.cells[0];
    if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x", "t", "T"].includes(event.key) && sc) {
      if (event.key == "Delete" || event.key == "x") {
        this.state.grid[sc[1]][sc[0]] = "";
      } else if (event.key == "t") {
        if (this.state.grid[sc[1]][sc[0]] == "") {
          this.state.grid[sc[1]][sc[0]] = "10";
        } else {
          this.state.grid[sc[1]][sc[0]] = 10 + parseInt(this.state.grid[sc[1]][sc[0]]);
        }
      } else if (event.key == "T") {
        if (parseInt(this.state.grid[sc[1]][sc[0]]) == 10) {
          this.state.grid[sc[1]][sc[0]] = "";
        } else if (parseInt(this.state.grid[sc[1]][sc[0]]) > 10) {
          this.state.grid[sc[1]][sc[0]] = parseInt(this.state.grid[sc[1]][sc[0]]) - 10;
        }
      } else {
        this.state.grid[sc[1]][sc[0]] = event.key;
      }
    } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && sc) {
      if (event.key == "ArrowUp" && sc[1] > 0) {
        sc[1] -= 1;
      } else if (event.key == "ArrowDown" && sc[1] < this.grid_def.grid_height - 1) {
        sc[1] += 1;
      } else if (event.key == "ArrowLeft" && sc[0] > 0) {
        sc[0] -= 1;
      } else if (event.key == "ArrowRight" && sc[0] < this.grid_def.grid_width - 1) {
        sc[0] += 1;
      }
    } else if (["w", "a", "s", "d"].includes(event.key) && sc) {
      if (event.key == "w" && sc[1] > 0) {
        toggle_edge_state(this.state.edges, sc[0], sc[1], 1);
      } else if (event.key == "a" && sc[0] > 0) {
        toggle_edge_state(this.state.edges, sc[0], sc[1], 2);
      } else if (event.key == "s" && sc[1] < this.grid_def.grid_height - 1) {
        toggle_edge_state(this.state.edges, sc[0], sc[1] + 1, 1);
      } else if (event.key == "d" && sc[0] < this.grid_def.grid_width - 1) {
        toggle_edge_state(this.state.edges, sc[0] + 1, sc[1], 2);
      }
    }

    this.render();
  }

  on_csv_change(event) {
    this.state = {
      grid: [],
      edges: {},
      history: []
    };
    this.selection = {
      cells: [],
      down: false
    };

    const csv = event.target.value;
    const parsed_csv = [];
    const csv_rows = csv.split("\n");
    var error_message = null;
    var last_length = -1;
    for (var r = 0; r < csv_rows.length; r += 1) {
      const stripped_row = csv_rows[r].trim().replace(/ /g, "");
      if (stripped_row.length > 0) {
        const split_row = stripped_row.split(",");

        if (last_length != -1 && last_length != split_row.length) {
          error_message = "Mismatched row lengths.";
        }
        for (var c = 0; c < split_row.length; c += 1) {
          if (c.length > 0 && c.match(/^\d+$/) == null) {
            error_message = "Non-numeric cells detected.";
          }
        }

        last_length = split_row.length;
        parsed_csv.push(split_row);
      }
    }

    if (error_message == null) {
      this.grid_def.grid_height = parsed_csv.length;
      this.grid_def.grid_width = last_length;

      this.state.grid = [];
      for (var y = 0; y < parsed_csv.length; y += 1) {
        const cell_row = [];
        for (var x = 0; x < parsed_csv[y].length; x += 1) {
          cell_row.push(parsed_csv[y][x]);
        }
        this.state.grid.push(cell_row);
      }

      this.render();
    } else {
      console.log(error_message);
    }
  }

  render() {
    context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);
    draw_selection(this.grid_def, this.selection);
    draw_grid(this.grid_def, this.state.edges);
    this.draw_numbers();
    this.output_csv();
  }

  draw_numbers() {
    context.font = "" + Math.floor(min_cell_size(this.grid_def) * 0.8) + "px serif";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (var y = 0; y < this.grid_def.grid_height; y += 1) {
      for (var x = 0; x < this.grid_def.grid_width; x += 1) {
        if (this.state.grid[y][x] != "") {
          context.fillText(
            this.state.grid[y][x],
            ((x + 0.5) * min_cell_size(this.grid_def)) + edge_margin(this.grid_def),
            ((y + 0.5) * min_cell_size(this.grid_def)) + edge_margin(this.grid_def)
          );
        }
      }
    }
  }

  output_csv() {
    var csv_out = "";
    for (var y = 0; y < this.grid_def.grid_height; y += 1) {
      for (var x = 0; x < this.grid_def.grid_width; x += 1) {
        csv_out += this.state.grid[y][x];

        if (x != this.grid_def.grid_width - 1) {
          csv_out += ",";
        }
      }
      csv_out += "\n";
    }

    csv.value = csv_out;
  }
}

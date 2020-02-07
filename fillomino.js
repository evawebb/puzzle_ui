class Fillomino {
  constructor() {
    this.grid_def = {
      canvas_size: master_canvas_size,
      grid_width: 10,
      grid_height: 10,
      edge_margin_multiplier: 0.2,
      edge_width: 4
    };
    this.cell_state = [];
    this.edge_state = {};
    this.selected = null;

    for (var y = 0; y < this.grid_def.grid_height; y += 1) {
      var cell_row = [];
      for (var x = 0; x < this.grid_def.grid_width; x += 1) {
        cell_row.push("");
      }
      this.cell_state.push(cell_row);
    }

    canvas.addEventListener("mouseup", this.on_mouseup.bind(this));
    document.addEventListener("keydown", this.on_key.bind(this));
    this.render();
  }

  on_mouseup(event) {
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    console.log(this);
    console.log(this.grid_def);
    var cell_x = Math.floor((x - edge_margin(this.grid_def)) / min_cell_size(this.grid_def));
    var cell_y = Math.floor((y - edge_margin(this.grid_def)) / min_cell_size(this.grid_def));
    this.selected = [cell_x, cell_y];

    this.render();
  }

  on_key(event) {
    expand_grid(
      event,
      this.grid_def,
      [{
        obj: this.cell_state,
        default: ""
      }],
      this.render
    );

    if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x", "t", "T"].includes(event.key) && this.selected) {
      if (event.key == "Delete" || event.key == "x") {
        this.cell_state[this.selected[1]][this.selected[0]] = "";
      } else if (event.key == "t") {
        if (this.cell_state[this.selected[1]][this.selected[0]] == "") {
          this.cell_state[this.selected[1]][this.selected[0]] = "10";
        } else {
          this.cell_state[this.selected[1]][this.selected[0]] = 10 + parseInt(this.cell_state[this.selected[1]][this.selected[0]]);
        }
      } else if (event.key == "T") {
        if (parseInt(this.cell_state[this.selected[1]][this.selected[0]]) == 10) {
          this.cell_state[this.selected[1]][this.selected[0]] = "";
        } else if (parseInt(this.cell_state[this.selected[1]][this.selected[0]]) > 10) {
          this.cell_state[this.selected[1]][this.selected[0]] = parseInt(this.cell_state[this.selected[1]][this.selected[0]]) - 10;
        }
      } else {
        this.cell_state[this.selected[1]][this.selected[0]] = event.key;
      }
    } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key) && this.selected) {
      if (event.key == "ArrowUp" && this.selected[1] > 0) {
        this.selected[1] -= 1;
      } else if (event.key == "ArrowDown" && this.selected[1] < this.grid_def.grid_height - 1) {
        this.selected[1] += 1;
      } else if (event.key == "ArrowLeft" && this.selected[0] > 0) {
        this.selected[0] -= 1;
      } else if (event.key == "ArrowRight" && this.selected[0] < this.grid_def.grid_width - 1) {
        this.selected[0] += 1;
      }
    } else if (["w", "a", "s", "d"].includes(event.key) && this.selected) {
      if (event.key == "w" && this.selected[1] > 0) {
        toggle_edge_state(this.edge_state, this.selected[0], this.selected[1], 1);
      } else if (event.key == "a" && this.selected[0] > 0) {
        toggle_edge_state(this.edge_state, this.selected[0], this.selected[1], 2);
      } else if (event.key == "s" && this.selected[1] < this.grid_def.grid_height - 1) {
        toggle_edge_state(this.edge_state, this.selected[0], this.selected[1] + 1, 1);
      } else if (event.key == "d" && this.selected[0] < this.grid_def.grid_width - 1) {
        toggle_edge_state(this.edge_state, this.selected[0] + 1, this.selected[1], 2);
      }
    }

    this.render();
  }

  render() {
    context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);
    this.draw_selected();
    draw_grid(this.grid_def, this.edge_state);
    this.draw_numbers();
  }

  draw_selected() {
    if (this.selected) {
      context.fillStyle = "rgba(0, 255, 0, 0.5)";
      context.fillRect(
        this.selected[0] * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
        this.selected[1] * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
        min_cell_size(this.grid_def),
        min_cell_size(this.grid_def)
      );
    }
  }

  draw_numbers() {
    context.font = "" + Math.floor(min_cell_size(this.grid_def) * 0.8) + "px serif";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (var y = 0; y < this.grid_def.grid_height; y += 1) {
      for (var x = 0; x < this.grid_def.grid_width; x += 1) {
        context.fillText(
          this.cell_state[y][x],
          ((x + 0.5) * min_cell_size(this.grid_def)) + edge_margin(this.grid_def),
          ((y + 0.5) * min_cell_size(this.grid_def)) + edge_margin(this.grid_def)
        );
      }
    }
  }
}

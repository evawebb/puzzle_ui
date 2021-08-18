class Tapa {
    constructor() {
        this.grid_def = {
            canvas_size: master_canvas_size,
            grid_width: 10,
            grid_height: 10,
            edge_margin_multiplier: 0.2,
            edge_width_multiplier: 0.1
        };
        this.state = {
            grid: [],
            history: [],
        };
        this.selection = {
            cells: [],
            down: false
        };

        init_state(
            [{ obj: this.state.grid, default: "" }],
            this.grid_def
        );

        canvas.addEventListener("mousedown", get_mouse_select_down_listener(this));
        canvas.addEventListener("mousemove", get_mouse_select_move_listener(this, true));
        canvas.addEventListener("mouseup", get_mouse_select_up_listener(this));
        document.addEventListener("keydown", this.on_key.bind(this));

        this.render();
    }

    on_key(event) {
        expand_grid(
            event,
            this.grid_def,
            [{ obj: this.state.grid, default: "" }],
            this.render.bind(this)
        );
        arrow_keys_select(
            event,
            this.grid_def,
            this.selection,
            this.render.bind(this)
        );

        if (event.key == "u") {
            undo(this.state);
        } else if (this.selection.cells.length > 0 && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x"].includes(event.key)) {
            for (var i = 0; i < this.selection.cells.length; i += 1) {
                var cell = this.state.grid[this.selection.cells[i][1]][this.selection.cells[i][0]];
                if (event.key == "Delete" || event.key == "x") {
                    cell = "";
                } else if (cell != "b" && cell != "w") {
                    const cell_split = cell.split("");
                    cell_split.push(event.key);
                    cell_split.sort();
                    cell = cell_split.join("");
                }
                set_state(
                    this.state,
                    [this.selection.cells[i]],
                    cell
                );
            }
        } else if (this.selection.cells.length > 0 && event.key == " ") {
            for (var i = 0; i < this.selection.cells.length; i += 1) {
                var cell = this.state.grid[this.selection.cells[i][1]][this.selection.cells[i][0]];
                if (cell == "") {
                    cell = "b";
                } else if (cell == "b") {
                    cell = "w";
                } else if (cell == "w") {
                    cell = "";
                }
                set_state(
                    this.state,
                    [this.selection.cells[i]],
                    cell
                );
            }
        }

        this.render();
    }

    on_csv_change(event) {
        this.state = {
            grid: [],
            history: []
        };
        this.selection = {
            cells: [],
            down: false
        };

        load_csv(event, this.grid_def, this.state);
        this.render();
    }

    render() {
        context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);
        
        draw_selection(this.grid_def, this.selection);
        draw_grid(this.grid_def);
        this.draw_numbers();
        this.draw_marks();
        this.render_csv();
    }

    draw_numbers() {
        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.textBaseline = "middle";

        for (var x = 0; x < this.grid_def.grid_width; x += 1) {
            for (var y = 0; y < this.grid_def.grid_height; y += 1) {
                var cell = this.state.grid[y][x];
                if (cell.length > 0 && cell != "w" && cell != "b") {
                    if (cell.length == 1) {
                        context.font = "" + Math.floor(min_cell_size(this.grid_def) * 0.8) + "px serif";
                        context.fillText(
                            cell,
                            (x + 0.5) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.5) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                    } else if (cell.length == 2) {
                        context.font = "" + Math.floor(min_cell_size(this.grid_def) * 0.5) + "px serif";
                        context.fillText(
                            cell[0],
                            (x + 0.35) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.35) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                        context.fillText(
                            cell[1],
                            (x + 0.65) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.65) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                    } else if (cell.length == 3) {
                        context.font = "" + Math.floor(min_cell_size(this.grid_def) * 0.5) + "px serif";
                        context.fillText(
                            cell[0],
                            (x + 0.25) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.35) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                        context.fillText(
                            cell[1],
                            (x + 0.75) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.35) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                        context.fillText(
                            cell[2],
                            (x + 0.5) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.65) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                    } else if (cell.length == 4) {
                        context.font = "" + Math.floor(min_cell_size(this.grid_def) * 0.5) + "px serif";
                        context.fillText(
                            cell[0],
                            (x + 0.5) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.25) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                        context.fillText(
                            cell[1],
                            (x + 0.25) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.5) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                        context.fillText(
                            cell[2],
                            (x + 0.75) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.5) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                        context.fillText(
                            cell[3],
                            (x + 0.5) * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                            (y + 0.75) * min_cell_size(this.grid_def) + edge_margin(this.grid_def)
                        );
                    }
                }
            }
        }
    }

    draw_marks() {
        context.fillStyle = "#000000";

        for (var x = 0; x < this.grid_def.grid_width; x += 1) {
            for (var y = 0; y < this.grid_def.grid_height; y += 1) {
                var cell = this.state.grid[y][x];
                if (cell == "w") {
                    context.beginPath();
                    context.arc(
                        x * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                        y * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                        (min_cell_size(this.grid_def) - 4 * edge_margin(this.grid_def)) / 2,
                        0,
                        2 * Math.PI,
                        false
                    );
                    context.fill();
                } else if (cell == "b") {
                    context.fillRect(
                        x * min_cell_size(this.grid_def) + 1.5 * edge_margin(this.grid_def),
                        y * min_cell_size(this.grid_def) + 1.5 * edge_margin(this.grid_def),
                        min_cell_size(this.grid_def) - edge_margin(this.grid_def),
                        min_cell_size(this.grid_def) - edge_margin(this.grid_def)
                    );
                }
            }
        }
    }

    render_csv() {
        output_csv(this.grid_def, this.state, "");
    }
}

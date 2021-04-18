class Nurikabe {
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

        canvas.addEventListener("mousedown", (function(event) {
            mouse_select_down(event, this.grid_def, this.selection, this.render.bind(this));
        }).bind(this));
        canvas.addEventListener("mousemove", (function(event) {
            mouse_select_move(event, this.grid_def, this.selection, false, this.render.bind(this));
        }).bind(this));
        canvas.addEventListener("mouseup", (function(event) {
            mouse_select_up(event, this.grid_def, this.selection, this.render.bind(this));
        }).bind(this));
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

        const sc = this.selection.cells[0];
        if (event.key == "u") {
            undo(this.state);
        } else if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x", "t", "T"].includes(event.key) && sc) {
            var new_state = null;
            if (event.key == "Delete" || event.key == "x") {
                new_state = "";
            } else if (event.key == "t") {
                if (this.state.grid[sc[1]][sc[0]] == "") {
                    new_state = "10";
                } else {
                    new_state = 10 + parseInt(this.state.grid[sc[1]][sc[0]]);
                }
            } else if (event.key == "T") {
                if (parseInt(this.state.grid[sc[1]][sc[0]]) <= 10) {
                    new_state = "";
                } else if (parseInt(this.state.grid[sc[1]][sc[0]]) > 10) {
                    new_state = parseInt(this.state.grid[sc[1]][sc[0]]) - 10;
                }
            } else {
                new_state = event.key;
            }

            set_state(
                this.state,
                [[sc[0], sc[1]]],
                new_state
            );
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
        context.font = "" + Math.floor(min_cell_size(this.grid_def) * 0.8) + "px serif";
        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        for (var y = 0; y < this.grid_def.grid_height; y += 1) {
            for (var x = 0; x < this.grid_def.grid_width; x += 1) {
                if (this.state.grid[y][x] != "" && this.state.grid[y][x] != "w" && this.state.grid[y][x] != "b") {
                    context.fillText(
                        this.state.grid[y][x],
                        ((x + 0.5) * min_cell_size(this.grid_def)) + edge_margin(this.grid_def),
                        ((y + 0.5) * min_cell_size(this.grid_def)) + edge_margin(this.grid_def)
                    );
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

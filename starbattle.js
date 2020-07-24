class Starbattle {
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
        }

        init_state(this.state, this.grid_def, "");

        canvas.addEventListener("mousedown", (function(event) {
            block_select_mousedown(event, this.grid_def, this.selection, this.render.bind(this));
        }).bind(this));
        canvas.addEventListener("mousemove", (function(event) {
            block_select_mousemove(event, this.grid_def, this.selection, this.render.bind(this));
        }).bind(this));
        canvas.addEventListener("mouseup", (function(event) {
            block_select_mouseup(event, this.grid_def, this.selection, this.render.bind(this));
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
        arrow_keys_select(
            event,
            this.grid_def,
            this.selection,
            this.render.bind(this)
        );

        if (event.key == "u") {
            undo(this.state);
        } else if (this.selection.cells.length > 0) { 
            var selected_cells_lookup = {};
            for (var i = 0; i < this.selection.cells.length; i += 1) {
                if (!selected_cells_lookup[this.selection.cells[i][0]]) {
                    selected_cells_lookup[this.selection.cells[i][0]] = {};
                }
                selected_cells_lookup[this.selection.cells[i][0]][this.selection.cells[i][1]] = true;
            }

            var deltas = [[-1, 0], [0, -1], [0, 1], [1, 0]];
            if (event.key == "g") {
                for (var i = 0; i < this.selection.cells.length; i += 1) {
                    var x = this.selection.cells[i][0];
                    var y = this.selection.cells[i][1];
                    for (var j = 0; j < 4; j += 1) {
                        var d = deltas[j];
                        var dx = x + d[0];
                        var dy = y + d[1];
                        if (!(selected_cells_lookup[dx] && selected_cells_lookup[dx][dy])) {
                            if (j == 0) {
                                set_edge_state(this.state.edges, x, y, 2, true);
                            } else if (j == 1) {
                                set_edge_state(this.state.edges, x, y, 1, true);
                            } else if (j == 2) {
                                set_edge_state(this.state.edges, x, y + 1, 1, true);
                            } else if (j == 3) {
                                set_edge_state(this.state.edges, x + 1, y, 2, true);
                            }
                        }
                    }
                }
            } else if (event.key == " ") {
                var first_coord = this.selection.cells[0];
                var first_value = this.state.grid[first_coord[1]][first_coord[0]];
                var next_value = "";
                if (first_value == "") {
                    next_value = "n";
                } else if (first_value == "n") {
                    next_value = "s";
                }

                set_state(
                    this.state,
                    this.selection.cells,
                    next_value
                );
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

        const extra = load_csv(event, this.grid_def, this.state);
        load_extra_edge_state(extra, this.state);
        this.render();
    }

    render() {
        context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);

        draw_selection(this.grid_def, this.selection);
        draw_grid(this.grid_def, this.state.edges);
        this.draw_marks();
        this.render_csv();
    }

    draw_marks() {
        for (var y = 0; y < this.grid_def.grid_height; y += 1) {
            for (var x = 0; x < this.grid_def.grid_width; x += 1) {
                context.fillStyle = "#000000";
                if (this.state.grid[y][x] == "n") {
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
                } else if (this.state.grid[y][x] == "s") {
                    context.fillRect(
                        x * min_cell_size(this.grid_def) + 2 * edge_margin(this.grid_def),
                        y * min_cell_size(this.grid_def) + 2 * edge_margin(this.grid_def),
                        min_cell_size(this.grid_def) - 2 * edge_margin(this.grid_def),
                        min_cell_size(this.grid_def) - 2 * edge_margin(this.grid_def)
                    );
                }
            }
        }
    }

    render_csv() {
        output_csv(this.grid_def, this.state, render_extra_csv_edge_state(this.state));
    }
}

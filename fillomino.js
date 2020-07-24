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

        const extra = load_csv(event, this.grid_def, this.state);
        load_extra_edge_state(extra, this.state);
        this.render();
    }

    render() {
        context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);
        draw_selection(this.grid_def, this.selection);
        draw_grid(this.grid_def, this.state.edges);
        this.draw_numbers();
        this.render_csv();
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

    render_csv() {
        output_csv(this.grid_def, this.state, render_extra_csv_edge_state(this.state));
    }
}

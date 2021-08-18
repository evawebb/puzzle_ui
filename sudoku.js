class Sudoku {
    constructor() {
        this.grid_def = {
            canvas_size: master_canvas_size,
            grid_width: 9,
            grid_height: 9,
            edge_margin_multiplier: 0.2,
            edge_width_multiplier: 0.1
        };
        this.state = {
            grid: [],
            edges: {},
            notes: [],
            history: []
        };
        this.selection = {
            cells: [],
            down: false
        };

        init_state(
            [
                { obj: this.state.grid, default: "" },
                { obj: this.state.notes, default: false }
            ],
            this.grid_def
        );

        for (var y = 0; y < this.grid_def.grid_height; y += 1) {
            for (var x = 0; x < this.grid_def.grid_width; x += 1) {
                if (y == 3 || y == 6) {
                    toggle_edge_state(this.state, x, y, 1);
                }
                if (x == 3 || x == 6) {
                    toggle_edge_state(this.state, x, y, 2);
                }
            }
        }

        canvas.addEventListener("mousedown", get_mouse_select_down_listener(this));
        canvas.addEventListener("mousemove", get_mouse_select_move_listener(this, true));
        canvas.addEventListener("mouseup", get_mouse_select_up_listener(this));
        document.addEventListener("keydown", this.on_key.bind(this));

        this.render();
    }

    on_key(event) {
        arrow_keys_select(
            event,
            this.grid_def,
            this.selection,
            this.render.bind(this)
        );

        if (this.selection.cells.length > 0 && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete", "x"].includes(event.key)) {
            for (var i = 0; i < this.selection.cells.length; i += 1) {
                var cell = this.state.grid[this.selection.cells[i][1]][this.selection.cells[i][0]];
                if (event.key == "Delete" || event.key == "x") {
                    cell = "";
                } else {
                    if (cell.includes(event.key)) {
                        cell = cell.replaceAll(event.key, "");
                    } else {
                        const cell_split = cell.split("");
                        cell_split.push(event.key);
                        cell_split.sort();
                        cell = cell_split.join("");
                    }
                }
                this.state.grid[this.selection.cells[i][1]][this.selection.cells[i][0]] = cell;
            } 
        } else if (this.selection.cells.length > 0 && event.key == "n") {
            for (var i = 0; i < this.selection.cells.length; i += 1) {
                this.state.notes[this.selection.cells[i][1]][this.selection.cells[i][0]] = !this.state.notes[this.selection.cells[i][1]][this.selection.cells[i][0]]
            }
        }

        this.render();
    }

    on_csv_change(event) {
        this.state = {
            grid: [],
            edges: this.state.edges,
            notes: [],
            history: []
        };
        this.selection = {
            cells: [],
            down: false
        };

        const extra = load_csv(event, this.grid_def, this.state);
        load_extra_boolean_grid(extra, this.state.notes);
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
        for (var x = 0; x < this.grid_def.grid_width; x += 1) {
            for (var y = 0; y < this.grid_def.grid_height; y += 1) {
                var cell = this.state.grid[y][x];
                if (cell.length > 0) {
                    var font_size = null;
                    var text = null;

                    // Format the text appropriately
                    if (cell.length <= 5) {
                        text = [cell];
                    } else if (cell.length > 5) {
                        text = [
                            cell.slice(0, 5),
                            cell.slice(5)
                        ];
                    }

                    // Set the font size 
                    if (cell.length == 1 && !this.state.notes[y][x]) {
                        context.font = "" + Math.floor(cell_height(this.grid_def) * 0.8) + "px serif";
                    } else {
                        context.font = "" + Math.floor(cell_height(this.grid_def) * 0.4) + "px serif";
                    }

                    // Set the text color
                    context.fillStyle = "#000000";

                    // Set the text alignment
                    if (!this.state.notes[y][x]) {
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                    } else {
                        context.textAlign = "left";
                        context.textBaseline = "top";
                    }

                    // Draw the text
                    for (var i = 0; i < text.length; i += 1) {
                        if (!this.state.notes[y][x]) {
                            context.fillText(
                                text[i],
                                (x + 0.5) * cell_width(this.grid_def) + edge_margin(this.grid_def),
                                (y + ((i + 1) / (text.length + 1))) * cell_height(this.grid_def) + edge_margin(this.grid_def)
                            );
                        } else {
                            context.fillText(
                                text[i],
                                (x + 0.02) * cell_width(this.grid_def) + edge_margin(this.grid_def),
                                (y + (i / 3) + 0.02) * cell_height(this.grid_def) + edge_margin(this.grid_def)
                            );
                        }
                    }
                }
            }
        }
    }

    render_csv() {
        output_csv(this.grid_def, this.state, render_extra_csv_boolean_grid(this.state.notes));
    }
}

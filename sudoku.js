class Sudoku {
    constructor() {
        this.grid_def = {
            canvas_size: master_canvas_size,
            grid_width: 9,
            grid_height: 9,
            edge_margin_multiplier: 0.2,
            edge_width: 4
        };

        this.selection = {
            cells: [],
            down: false
        };

        this.state = [];
        this.locks = [];
        this.notes = [];
        this.edges = {};

        for (var y = 0; y < this.grid_def.grid_height; y += 1) {
            var state_row = [];
            var lock_row = []
            var note_row = [];
            for (var x = 0; x < this.grid_def.grid_width; x += 1) {
                state_row.push([]);
                lock_row.push(false);
                note_row.push(false);

                if (y == 3 || y == 6) {
                    toggle_edge_state(this.edges, x, y, 1);
                }
                if (x == 3 || x == 6) {
                    toggle_edge_state(this.edges, x, y, 2);
                }
            }
            this.state.push(state_row);
            this.locks.push(lock_row);
            this.notes.push(note_row);
        }

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
        if (this.selection.cells.length > 0 && ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Delete"].includes(event.key)) {
            for (var i = 0; i < this.selection.cells.length; i += 1) {
                if (!this.locks[this.selection.cells[i][1]][this.selection.cells[i][0]]) {
                    var cell = this.state[this.selection.cells[i][1]][this.selection.cells[i][0]]
                    if (event.key == "Delete") {
                        cell.splice(0, cell.length);
                    } else {
                        if (cell.includes(event.key)) {
                            cell.splice(cell.indexOf(event.key), 1);
                        } else {
                            cell.push(event.key);
                        }
                    }
                }
            } 
        } else if (this.selection.cells.length == 1 && event.key == "ArrowUp" && this.selection.cells[0][1] > 0) {
            this.selection.cells[0][1] -= 1;
        } else if (this.selection.cells.length == 1 && event.key == "ArrowDown" && this.selection.cells[0][1] < this.grid_def.grid_height - 1) {
            this.selection.cells[0][1] += 1;
        } else if (this.selection.cells.length == 1 && event.key == "ArrowLeft" && this.selection.cells[0][0] > 0) {
            this.selection.cells[0][0] -= 1;
        } else if (this.selection.cells.length == 1 && event.key == "ArrowRight" && this.selection.cells[0][0] < this.grid_def.grid_width - 1) {
            this.selection.cells[0][0] += 1;
        } else if (this.selection.cells.length > 0 && event.key == "n") {
            for (var i = 0; i < this.selection.cells.length; i += 1) {
                this.notes[this.selection.cells[i][1]][this.selection.cells[i][0]] = !this.notes[this.selection.cells[i][1]][this.selection.cells[i][0]]
            }
        }

        this.render();
    }

    render() {
        context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);

        draw_selection(this.grid_def, this.selection);
        draw_grid(this.grid_def, this.edges);
        this.draw_numbers();
    }

    draw_highlight() {
        for (var i = 0; i < this.selection.cells.length; i += 1) {
            context.fillStyle = "#a0ffa0";
            context.fillRect(
                this.selection.cells[i][0] * cell_width(this.grid_def) + edge_margin(this.grid_def),
                this.selection.cells[i][1] * cell_height(this.grid_def) + edge_margin(this.grid_def),
                cell_width(this.grid_def),
                cell_height(this.grid_def)
            );
        }
    }

    draw_numbers() {
        for (var x = 0; x < this.grid_def.grid_width; x += 1) {
            for (var y = 0; y < this.grid_def.grid_height; y += 1) {
                var cell = this.state[y][x];
                if (cell.length > 0) {
                    var font_size = null;
                    var text = null;

                    // Format the text appropriately
                    if (cell.length == 1) {
                        text = cell;
                    } else if (1 < cell.length && cell.length <= 5) {
                        text = [cell.sort().join("")];
                    } else if (5 < cell.length) {
                        text = [
                            cell.sort().slice(0, 5).join(""),
                            cell.sort().slice(5).join("")
                        ];
                    }

                    // Set the font size 
                    if (cell.length == 1 && !this.notes[y][x]) {
                        context.font = "" + Math.floor(cell_height(this.grid_def) * 0.8) + "px serif";
                    } else {
                        context.font = "" + Math.floor(cell_height(this.grid_def) * 0.4) + "px serif";
                    }

                    // Set the text color
                    context.fillStyle = "#000000";

                    // Set the text alignment
                    if (!this.notes[y][x]) {
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                    } else {
                        context.textAlign = "left";
                        context.textBaseline = "top";
                    }

                    // Draw the text
                    for (var i = 0; i < text.length; i += 1) {
                        if (!this.notes[y][x]) {
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
}

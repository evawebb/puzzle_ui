class Masyu {
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
            paths: [],
            path_start: null
        };
        this.selection = {
            cells: [],
            down: false
        };

        for (var y = 0; y < this.grid_def.grid_height; y += 1) {
            var row = [];
            for (var x = 0; x < this.grid_def.grid_width; x += 1) {
                row.push("e");
            }
            this.state.grid.push(row);
        }

        canvas.addEventListener("mousedown", (function(event) {
            mouse_select_down(event, this.grid_def, this.selection, this.render.bind(this));
        }).bind(this));
        canvas.addEventListener("mousemove", (function(event) {
            mouse_select_move(event, this.grid_def, this.selection, false, this.render.bind(this));
        }).bind(this));
        canvas.addEventListener("mouseup", (function(event) {
            mouse_select_up(event, this.grid_def, this.selection, this.render.bind(this));

            var x = this.selection.cells[0][0];
            var y = this.selection.cells[0][1];
            if (event.shiftKey) {
                if (this.state.grid[y][x] == "e") {
                    this.state.grid[y][x] = "b";
                } else if (this.state.grid[y][x] == "b") {
                    this.state.grid[y][x] = "w";
                } else if (this.state.grid[y][x] == "w") {
                    this.state.grid[y][x] = "e";
                }
            } else {
                if (this.state.path_start) {
                    if (x == this.state.path_start[0] && y != this.state.path_start[1]) {
                        if (y < this.state.path_start[1]) {
                            this.state.paths.push([[x, y], this.state.path_start]);
                        } else {
                            this.state.paths.push([this.state.path_start, [x, y]]);
                        }
                    } else if (x != this.state.path_start[0] && y == this.state.path_start[1]) {
                        if (x < this.state.path_start[0]) {
                            this.state.paths.push([[x, y], this.state.path_start]);
                        } else {
                            this.state.paths.push([this.state.path_start, [x, y]]);
                        }
                    }
                    this.state.path_start = null;
                } else {
                    this.state.path_start = [x, y];
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
                obj: this.state.grid,
                default: "e"
            }],
            this.render.bind(this)
        );

        if (event.key == "u" || event.key == "U") {
            this.state.paths.pop();
        }

        this.render();
    }

    on_csv_change(event) {
        this.state = {
            grid: [],
            paths: [],
            path_start: null
        };
        this.selection = {
            cells: [],
            down: false
        };

        const extra = load_csv(event, this.grid_def, this.state);
        for (var i = 0; i < extra.length; i += 1) {
            this.state.paths.push([
                [
                    extra[i][0],
                    extra[i][1]
                ],
                [
                    extra[i][2],
                    extra[i][3]
                ]
            ]);
        }
        this.render();
    }

    render() {
        context.clearRect(0, 0, this.grid_def.canvas_size, this.grid_def.canvas_size);

        draw_grid(this.grid_def);
        this.draw_circles();
        this.draw_paths();
        this.render_csv();
    }

    draw_circles() {
        context.strokeStyle = "#000000";
        context.fillStyle = "#000000";
        for (var x = 0; x < this.grid_def.grid_width; x += 1) {
            for (var y = 0; y < this.grid_def.grid_height; y += 1) {
                if (this.state.grid[y][x] != "e") {
                    context.beginPath();
                    context.arc(
                        x * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def), 
                        y * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                        min_cell_size(this.grid_def) / 2 - min_cell_size(this.grid_def) * 0.1,
                        0,
                        2 * Math.PI,
                        false
                    );
                    if (this.state.grid[y][x] == "b") {
                        context.fill();
                    } else if (this.state.grid[y][x] == "w") {
                        context.stroke();
                    }
                }
            }
        }
    }

    draw_paths() {
        if (this.state.path_start) {
            context.fillStyle = "rgba(255, 0, 0, 0.5)";
            context.fillRect(
                this.state.path_start[0] * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                this.state.path_start[1] * min_cell_size(this.grid_def) + edge_margin(this.grid_def),
                min_cell_size(this.grid_def),
                min_cell_size(this.grid_def)
            );
        }

        context.fillStyle = "#ff0000";
        for (var i = 0; i < this.state.paths.length; i += 1) {
            context.beginPath();
            context.arc(
                this.state.paths[i][0][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                this.state.paths[i][0][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                5,
                0,
                2 * Math.PI,
                false
            );
            context.fill();
            context.beginPath();
            context.arc(
                this.state.paths[i][1][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                this.state.paths[i][1][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                5,
                0,
                2 * Math.PI,
                false
            );
            context.fill();
            if (this.state.paths[i][0][0] == this.state.paths[i][1][0]) {
                context.fillRect(
                    this.state.paths[i][0][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 - 5 + edge_margin(this.grid_def),
                    this.state.paths[i][0][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                    10,
                    (this.state.paths[i][1][1] - this.state.paths[i][0][1]) * min_cell_size(this.grid_def)
                );
            } else if (this.state.paths[i][0][1] == this.state.paths[i][1][1]) {
                context.fillRect(
                    this.state.paths[i][0][0] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 + edge_margin(this.grid_def),
                    this.state.paths[i][0][1] * min_cell_size(this.grid_def) + min_cell_size(this.grid_def) / 2 - 5 + edge_margin(this.grid_def),
                    (this.state.paths[i][1][0] - this.state.paths[i][0][0]) * min_cell_size(this.grid_def),
                    10
                );
            }
        }
    }

    render_csv() {
        var extra = "";
        for (var i = 0; i < this.state.paths.length; i += 1) {
            extra += [
                this.state.paths[i][0][0],
                this.state.paths[i][0][1],
                this.state.paths[i][1][0],
                this.state.paths[i][1][1]
            ].join(",");
            extra += "|";
        }
        output_csv(this.grid_def, this.state, extra);
    }
}

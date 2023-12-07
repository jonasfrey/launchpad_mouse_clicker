import {
    f_o_canvas_from_vertex_shader
} from "https://deno.land/x/handyhelpers@2.4/mod.js";
import {
    O_vec2
} from "https://deno.land/x/vector@1.1/mod.js"
const socket = new WebSocket(`${window.location.protocol.replace('http', 'ws')}//${window.location.host}`);

let o_scl = new O_vec2(500,500);
// Connection opened
socket.addEventListener("open", (event) => {

    let o_scl_small = new O_vec2(9,9);
    // Assuming originalCanvas is your original canvas element

    // Create a new, smaller canvas
    var o_canvas_small = document.createElement('canvas');
    o_canvas_small.width = o_scl_small.n_x;
    o_canvas_small.height = o_scl_small.n_y;
    var o_ctx_small = o_canvas_small.getContext('2d');
    o_canvas_small.style.width = `${o_scl.n_x}px`;
    o_canvas_small.style.height = `${o_scl.n_y}px`;
    o_canvas_small.style.imageRendering = 'pixelated';
    document.body.appendChild(o_canvas_small)
    let o_canvas = f_o_canvas_from_vertex_shader(
        `
        precision mediump float;
        varying vec2 o_trn_pixel_nor;
        uniform float n_t;

        void main() {
            float n_dist = length(o_trn_pixel_nor-0.5);
            float n1 = sin(n_dist*3.*3.+n_t*0.003)*.5+.5;
            float n2 = sin(n_dist*6.*3.+n_t*0.003)*.5+.5;
            float n3 = sin(n_dist*9.*3.+n_t*0.003)*.5+.5;
            gl_FragColor = vec4(
                pow(n1, 5.),
                n2, 
                n3,
                1.
            );
        }
        `, 
        500, 
        500
    )   
    document.body.appendChild(o_canvas);
    window.setInterval(
        function(){
            o_canvas.f_render(window.performance.now())
            // let o_ctx = o_canvas.getContext("webgl");
            // const pixels = new Uint8Array(
            // o_canvas.width * o_canvas.height * 4,
            // );
            // o_ctx.readPixels(
            // 0,
            // 0,
            // o_ctx.drawingBufferWidth,
            // o_ctx.drawingBufferHeight,
            // o_ctx.RGBA,
            // o_ctx.UNSIGNED_BYTE,
            // pixels,
            // );
            // console.log(pixels); // Uint8Array
            // socket.send({o_scl, a_n_u8: pixels })
            // socket.send('helo')

            // Draw the original canvas onto the smaller canvas, scaled down
            o_ctx_small.drawImage(o_canvas, 0, 0, o_canvas_small.width, o_canvas_small.height);
            var o_image_data = o_ctx_small.getImageData(0, 0, o_canvas_small.width, o_canvas_small.height); 
            console.log(o_image_data.data)
            socket.send(o_image_data.data)
        }, 
        1000/60
    )

});

// Listen for messages
socket.addEventListener("message", (event) => {
console.log("Message from server ", event.data);
});

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
    let a_o_canvas = [
        f_o_canvas_from_vertex_shader(
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
        ),   
        f_o_canvas_from_vertex_shader(
            `
            precision mediump float;
            varying vec2 o_trn_pixel_nor;
            uniform float n_t;
            float n_tau = 6.2831;
            vec2 f_o_hash(float p)
            {
                vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
                p3 += dot(p3, p3.yzx + 33.33);
                return fract((p3.xx+p3.yz)*p3.zy);
            
            }
            void main() {
                vec2 o_uv = (o_trn_pixel_nor);
                const float n_its = 50.;
                float n_min = 1.;
                float n_second = 1.;
                float n_third = 1.;
                for(float n_it = 0.; n_it<n_its;n_it+=1.){
                    float n_it_nor = n_it / n_its;
                    vec2 o_hash = f_o_hash(n_it_nor*200.);
                    vec2 o_trn_circle = vec2(
                        sin(n_t*0.001+n_it_nor*n_tau*n_it_nor), 
                        cos(n_t*0.001+n_it_nor*n_tau*n_it_nor)
                    )*n_it_nor*0.5;
    
                    float n_d = length(o_uv-o_hash+o_trn_circle);
                    if(n_d < n_min){
                        n_third = n_second;
                        n_second = n_min;
                        n_min = n_d;
                    }
                }
                gl_FragColor = vec4(
                    pow(1.-n_min, 20.),
                    pow(1.-n_second, 20.),
                    pow(1.-n_third, 20.),
                    1.
                );
            }
            `, 
            500, 
            500
        )
    ]
    for(let o_canvas of a_o_canvas){
        document.body.appendChild(o_canvas);
    }

    let n_idx = 0;
    let n_t = 0;
    window.setInterval(
        function(){
            n_t+=1;
            n_idx = parseInt(((n_t*0.001)%1)*a_o_canvas.length); 
            let o_canvas = a_o_canvas[n_idx];
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

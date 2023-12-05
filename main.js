import {
    O_vec2
} from "https://deno.land/x/vector@1.1/mod.js"
import {
    f_sleep_ms 
}from "https://deno.land/x/handyhelpers/mod.js";
import {
    o_robot_js
} from "https://deno.land/x/robotjs_proxy@0.2/mod.js";

import { midi } from "https://deno.land/x/deno_midi/mod.ts";

class O_mode{
    constructor(
        s_name, 
    ){
        this.s_name = s_name
    }
}
let o_mode__mouse_clicker = new O_mode(
    'mouse_clicker'
)

let o_mode__update_mouse_position = new O_mode(
    'update_mouse_position'
)

let o_mode__change_color = new O_mode(
    'change_color'
)

let a_o_mode = [
    o_mode__mouse_clicker,
    o_mode__update_mouse_position,
    o_mode__change_color
];

let a_o_color_from_palette = []
class O_color_from_palette{
    constructor(
        s_name, 
        n_number
    ){
        this.s_name = s_name
        this.n_number = n_number
    }
}

let o_color_from_palette__off = new O_color_from_palette('off', 0) 
let o_color_from_palette__white_dark = new O_color_from_palette('white_dark', 1) 
let o_color_from_palette__white_medium = new O_color_from_palette('white_medium', 2)
let o_color_from_palette__white_bright = new O_color_from_palette('white_bright', 3)
let o_color_from_palette__orange = new O_color_from_palette('orange', 9); 

a_o_color_from_palette.push(
    o_color_from_palette__off,
    o_color_from_palette__white_dark,
    o_color_from_palette__white_medium,
    o_color_from_palette__white_bright,
    o_color_from_palette__orange,
)
for(let n = 0; n < 128; n+=1){
    let o = O_color_from_palette.a_o.find(o=>o.n_number == n);
    if(!o){
        new O_color_from_palette(`color_${n}`, n);
    }
}

const midi_out = new midi.Output();
const midi_in = new midi.Input();
console.log(midi_out.getPorts());

midi_out.openPort(2);
midi_in.openPort(2);
midi_in.on("message", ({ message, deltaTime }) => {
    let o_button = O_button.a_o.find(
        o=>o.n_number == message?.data?.note
    )
    if(o_button){
        o_button.b_down = message?.data?.velocity == 127
    }
    if(o_button.b_down){
        o_button.f_on_down()
    }else{
        o_button.f_on_up()
    }
    console.log(message)

    console.log(o_button)
  });


// // Can also be sent with a helper class for better readability.
// midi_out.sendMessage(new midi.NoteOn({ note: 0x3C, velocity: 0x7F }));
// // Send a note off after 1 second.
// setTimeout(() => {
//   midi_out.sendMessage([0x80, 0x3C, 0x2F]);
//   midi_out.sendMessage(new midi.NoteOff({ note: 0x3C, velocity: 0x7F }));
// }, 1000);

// let n_color
class O_button{
    constructor(
        n_number, 
        b_down,
        o_color_from_palette,  
        f_render, 
        f_on_down, 
        f_on_up
    ){
        this.n_number = n_number
        this.b_down = b_down
        this.o_color_from_palette = o_color_from_palette 
        this.f_render = f_render
        this.f_on_down = f_on_down 
        this.f_on_up = f_on_up
        O_button.a_o.push(this)
    }
}
O_button.a_o = []


let n_fps = 24//60; 
let n_ms = 0; 
let n_ms_diff = 0;
let n_ms_last = 0;
let n_ms_frame = 1000/n_fps;
let n_t = 0;

let o_trn_mouse = new O_vec2(0);
let o_button__toggler = new O_button(
    36, 
    false,
    o_color_from_palette__white_bright,
    function(){
        
        // console.log(n_t);
    }, 
    function(){
        this.o_color_from_palette = O_color_from_palette.a_o[
            parseInt(Math.random()*O_color_from_palette.a_o.length)
        ]
        console.log(O_color_from_palette.a_o)
        
    },
    function(){}
);

let f_clear_screen = function(){
    for(let n = 36; n<8*8; n+=1){
        midi_out.sendMessage([0x90, n, 0])

    }
}
let f_render_frame = function(){
    f_clear_screen();
    // console.log('asdf')
    for(let o_button of O_button.a_o){
        o_button.f_render();
        midi_out.sendMessage([0x90, o_button.n_number, o_button.o_color_from_palette.n_number])
    }
}

while(true){
    n_t = (n_t+1)%10000;
    n_ms = window.performance.now();
    n_ms_diff = n_ms-n_ms_last;
    if(n_ms_diff > n_ms_frame){
        let v_mouse = JSON.parse(await o_robot_js.getMousePos())
        // console.log(typeof v_mouse)
        // console.log(v_mouse)
        o_trn_mouse = new O_vec2(...Object.values(v_mouse));
        // console.log(o_trn_mouse)
        f_render_frame()
        n_ms_last = n_ms;

    }
}

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

import {
    f_a_v__prompt
}from "https://deno.land/x/terminal_prompt_functions@0.6/mod.js"
import {
    o_s_name_class_O_class
}from "./classes.module.js"

let f_b_toggle_after_mod_n_ms = function(n_ms_current, n_ms_toggle){
    return (((n_ms_current / n_ms_toggle)*0.5)%1) < 0.5
}
let f_b_toggle_each_mod_n_id_frame = function(n_id_frame, n_id_frame_mod){
    return (((n_id_frame / n_id_frame_mod)*0.5)%1) < 0.5
}
let f_n_close_ms_to_sync_with_fps = function(n_ms, n_fps){
    let n_ms_per_frame = 1000/n_fps;
    let n = Math.round(n_ms/n_ms_per_frame)*n_ms_per_frame
    return n
}
let f_s_name_array_from_s_name_class = function(s){
    return `a_${s.trim().toLowerCase()}`
}
let f_add_missing_objects_to_arrays__in_o_state = function(o_state){
    let a_s_name_class = Object.keys(o_s_name_class_O_class);
    let a_s_name_array = a_s_name_class.map(s=>f_s_name_array_from_s_name_class(s));

    for(let s_name_class in o_s_name_class_O_class){
        let s_name_array = f_s_name_array_from_s_name_class(s_name_class)
        if(!o_state[s_name_array]){
            o_state[s_name_array] = []
        };
    }
    for(let s_prop in o_state){
        let v = o_state[s_prop];
        let s_name_class = a_s_name_class.find(s=>s_prop.startsWith(s.toLowerCase()))
        if(s_name_class){
            let a_o = o_state[f_s_name_array_from_s_name_class(s_name_class)]
            if(!a_o.includes(
                v
            )){
                a_o.push(v)
            }
        }
    }
}

let o_state = {
    n_fps:  33,
    n_ms:  0,
    n_ms_diff:  0,
    n_ms_last:  0,
    n_ms_frame:  1000,
    n_id_frame: 0,
    ...Object.assign({}, 
        Object.keys(o_s_name_class_O_class).map(
            s=>{
                return {
                    [f_s_name_array_from_s_name_class(s)]: []
                }
            }
        )
    ),
    o_trn_mouse: new O_vec2(0),
    ...Object.assign(
    {}, 
    ...[
        ['off',0], 
        ['white_dark',1], 
        ['white_medium',2],
        ['white_bright',3],
        ['orange',9], 
        ['yellow',13], 
        ['green',21], 
        ['turkis',29], 
        ['blue',37], 
        ['purple',45], 
        ['pink',53], 
    ].map(a_v=>{
        return {
            [`o_color_from_palette__${a_v[0]}`]: new o_s_name_class_O_class.O_color_from_palette(
                a_v[0], 
                a_v[1]
            )
        }
    })
    )
}
o_state.o_mode__mouse_clicker = new o_s_name_class_O_class.O_mode(
    'mouse_clicker', 
    `in this mode a button click sets the mouse to its related position and clicks the left mouse button one time`
)
o_state.o_mode__update_mouse_position = new o_s_name_class_O_class.O_mode(
    'update_mouse_position', 
    'a button blinks slowly to symbolize it is ready to get a new position click does store the current mouse position with itself and blinks rapidly to tell the user that the new position has been stored'
)
o_state.o_mode__change_color = new o_s_name_class_O_class.O_mode(
    'change_color', 
        `a buton does change the color when it is clicked this color will be stored so in this mode the colors of the buttons can be changed`
)
f_add_missing_objects_to_arrays__in_o_state(o_state)

o_state.a_o_color_from_palette__available_for_selecting = o_state.a_o_color_from_palette.filter(o=>!o.s_name.includes('off'));

o_state.n_ms_frame = 1000/o_state.n_fps
o_state.o_mode = o_state.o_mode__mouse_clicker;

o_state.o_button__toggler = new o_s_name_class_O_class.O_button(
    36, 
    false,
    o_state.o_color_from_palette__white_bright,
    function(){

        if(o_state.o_mode == o_state.o_mode__mouse_clicker){
            this.o_color_from_palette = o_state.o_color_from_palette__white_bright;
        }

        if(o_state.o_mode == o_state.o_mode__update_mouse_position){
            // this.o_color_from_palette = (f_b_toggle_after_mod_n_ms(o_state.n_ms, 100)) // this will have slight out of sync 'flickering'
            // this.o_color_from_palette = (f_b_toggle_each_mod_n_id_frame(o_state.n_id_frame, 5)) //but this is shitty because one does never know and remember how much one has
            this.o_color_from_palette = (
                f_b_toggle_after_mod_n_ms(
                    o_state.n_ms, 
                    f_n_close_ms_to_sync_with_fps(333, o_state.n_fps)// this will get the closest possible 
                )
            ) 
                ? o_state.o_color_from_palette__off
                : o_state.o_color_from_palette__white_bright;
        }
        if(o_state.o_mode == o_state.o_mode__change_color){
            // this.o_color_from_palette = (f_b_toggle_after_mod_n_ms(o_state.n_ms, 100)) // this will have slight out of sync 'flickering'
            // this.o_color_from_palette = (f_b_toggle_each_mod_n_id_frame(o_state.n_id_frame, 5)) //but this is shitty because one does never know and remember how much one has
            let n_t = (o_state.n_ms * (1/500))%1;
            this.o_color_from_palette = o_state.a_o_color_from_palette__available_for_selecting[
                parseInt(n_t*o_state.a_o_color_from_palette__available_for_selecting.length)
            ]
        }

        // console.log(n_t);
    }, 
    function(){
        // this.o_color_from_palette = o_state.a_o_color_from_palette[
        //     parseInt(Math.random()*o_state.a_o_color_from_palette.length)
        // ]
        let n_idx = (o_state.a_o_mode.indexOf(o_state.o_mode)+1)%o_state.a_o_mode.length;
        o_state.o_mode__last = o_state.o_mode;
        o_state.o_mode = o_state.a_o_mode[n_idx];
        // console.log(o_state.o_mode)

        // console.log(o_state.a_o_color_from_palette)
        
    },
    function(){}
);
f_add_missing_objects_to_arrays__in_o_state(o_state)

for(let n = 0; n < 128; n+=1){
    let o = o_state?.a_o_color_from_palette?.find(o=>o.n_number == n);
    if(!o){
        let o = new o_s_name_class_O_class.O_color_from_palette(`color_${n}`, n);
        o_state.a_o_color_from_palette.push(o)
    }
}


/// end init data 

let f_o_port_selected_from_a_o_port = function(a_o_port){
    let a_v = f_a_v__prompt(
        a_o_port,
        (a_v)=>{
            return a_v.map(
                (o,n_idx)=>{return `${n_idx}: ${o.s_name}`}
            ).join('\n')
        },
        (a_v, s_prompt_input)=>{
            return a_v.filter(
                (v, n_idx)=>{
                    function isNumeric(value) {
                        return /^-?\d+$/.test(value);
                    }
                    if(isNumeric(s_prompt_input)){
                        return parseInt(s_prompt_input)== n_idx
                    }
                    return v.s_name.toLowerCase() == (s_prompt_input.toLowerCase())
                }
            )
        }, 
        null,
        (s)=>`'${s}' invalid input`
    );
    return a_v[0]
}
class O_port{
    constructor(s_name, n_idx){
        this.s_name = s_name
        this.n_idx = n_idx
    }
}
const midi_out = new midi.Output();
const midi_in = new midi.Input();
let a_o_port_in = midi_in.getPorts().map((s, n_idx)=>{return new O_port(s, n_idx)});
let o_port_in_selected = f_o_port_selected_from_a_o_port(a_o_port_in);
let a_o_port_out = midi_out.getPorts().map((s, n_idx)=>{return new O_port(s, n_idx)});
let o_port_out_selected = f_o_port_selected_from_a_o_port(a_o_port_out);

midi_in.openPort(o_port_in_selected.n_idx);
midi_out.openPort(o_port_out_selected.n_idx);

midi_in.on("message", ({ message, deltaTime }) => {
    let o_button = o_state.a_o_button.find(
        o=>o.n_number == message?.data?.note
    )

    if(o_state.o_mode == o_state.o_mode__update_mouse_position){
        if(!o_button){
            o_button = new o_s_name_class_O_class.O_button(
                message?.data?.note, 
                true, 
                o_state.o_color_from_palette__yellow, 
                function(){

                    if(this.n_ms_down){

                        let n_ms_diff = o_state.n_ms - this?.n_ms_down;
                        console.log(n_ms_diff)
                        if(n_ms_diff > 600){
                            o_state.a_o_button.splice(
                                o_state.a_o_button.indexOf(this),
                                1
                            );
                        }
                    }
                    if(this?.n_ms__remaining_because_new_mouse_position_was_set_used_for_flickering_to_indicate_store > 0){
                        if(!this.o_color_from_palette__for_flickering){
                            this.o_color_from_palette__for_flickering = this.o_color_from_palette
                        }
                        this.n_ms__remaining_because_new_mouse_position_was_set_used_for_flickering_to_indicate_store
                         -= o_state.n_ms_diff;   
                         this.o_color_from_palette = (
                             f_b_toggle_after_mod_n_ms(
                                 o_state.n_ms, 
                                 f_n_close_ms_to_sync_with_fps(111, o_state.n_fps)// this will get the closest possible 
                             )
                         ) 
                             ? o_state.o_color_from_palette__off
                             : this.o_color_from_palette__for_flickering;
                        if(this.n_ms__remaining_because_new_mouse_position_was_set_used_for_flickering_to_indicate_store < 0){
                            // reset the original color
                           this.o_color_from_palette = this.o_color_from_palette__for_flickering;
                        }
                    }
                },
                async function(){
                    this.n_ms_down = o_state.n_ms;
                    if(o_state.o_mode == o_state.o_mode__mouse_clicker){
                        for(let o_trn of this?.a_o_trn_mouse){
                            o_robot_js.moveMouse(...o_trn.a_n_comp)
                            await f_sleep_ms(22);
                            o_robot_js.mouseClick();
                            await f_sleep_ms(22);
                        }

                    }
                    if(o_state.o_mode == o_state.o_mode__update_mouse_position){
                        if(
                            // o_state.o_mode__last != o_state.o_mode__update_mouse_position
                            // || 
                            !Array.isArray(this.a_o_trn_mouse)
                        ){
                            this.a_o_trn_mouse = []
                        }
                        console.log('pad donw')
                        console.log(o_state)
                        console.log(o_state.o_trn_mouse.clone())
                        this.a_o_trn_mouse.push(
                            o_state.o_trn_mouse.clone()
                        )
                        console.log(this.a_o_trn_mouse)
                        this.n_ms__remaining_because_new_mouse_position_was_set_used_for_flickering_to_indicate_store = 500;
                    }
                    if(o_state.o_mode == o_state.o_mode__change_color){
                        let n_idx = o_state.a_o_color_from_palette__available_for_selecting.indexOf(
                            this.o_color_from_palette
                        )
                        let n_idx_next = (n_idx+1)%o_state.a_o_color_from_palette__available_for_selecting.length;

                        this.o_color_from_palette = o_state.a_o_color_from_palette__available_for_selecting[
                            n_idx_next
                        ]
                    }
                    if(!this.n){
                        this.n = 0;
                    }
                    this.n = (this.n+1)%127;
                    this.o_color_from_palette = new o_s_name_class_O_class.O_color_from_palette('', this.n);
                },
                function(){
                    this.n_ms_down = false;
                }
            )
            o_button.n_ms_down = o_state.n_ms;
            // console.log(o_button)
            o_state.a_o_button.push(o_button);
            o_state.o_button = o_button
        }
    }
    
    if(o_button){
        o_state.o_button = o_button
        o_button.b_down = message?.data?.velocity == 127
        if(o_button.b_down){
            o_button.f_on_down()
        }else{
            o_button.f_on_up()
        }
    }
    // console.log(message)
    // console.log(o_button)
  });


// // Can also be sent with a helper class for better readability.
// midi_out.sendMessage(new midi.NoteOn({ note: 0x3C, velocity: 0x7F }));
// // Send a note off after 1 second.
// setTimeout(() => {
//   midi_out.sendMessage([0x80, 0x3C, 0x2F]);
//   midi_out.sendMessage(new midi.NoteOff({ note: 0x3C, velocity: 0x7F }));
// }, 1000);

// let n_color






let f_clear_screen = function(){
    for(let n = 36; n<36+(8*8); n+=1){
        midi_out.sendMessage([0x90, n, 0])

    }
}
let f_render_frame = function(){
    f_clear_screen();
    // console.log('asdf')
    for(let o_button of o_state.a_o_button){
        o_button.f_render();
        midi_out.sendMessage([0x90, o_button.n_number, o_button.o_color_from_palette.n_number])
    }
}



console.log(o_state.a_o_color_from_palette__available_for_selecting);
// Deno.exit()

while(true){
    o_state.n_ms = window.performance.now();
    o_state.n_ms_diff = o_state.n_ms-o_state.n_ms_last;
    if(o_state.n_ms_diff > o_state.n_ms_frame){
        let v_mouse = JSON.parse(await o_robot_js.getMousePos())
        // console.log(typeof v_mouse)
        // console.log(v_mouse)
        o_state.o_trn_mouse = new O_vec2(...Object.values(v_mouse));
        // console.log(o_trn_mouse)
        f_render_frame()
        o_state.n_id_frame+=1;
        o_state.n_ms_last = o_state.n_ms;

    }
}



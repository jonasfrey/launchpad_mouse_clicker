import {
    O_vec2,
    O_vec3,
} from "https://deno.land/x/vector@1.4/mod.js"

import {
    f_sleep_ms , 
    f_a_n_nor__rgb__from_a_n_nor__hsl, 
    f_v_at_n_idx_relative
}from "https://deno.land/x/handyhelpers@2.8/mod.js";
import {
    o_robot_js
} from "https://deno.land/x/robotjs_proxy@0.2/mod.js";

import { midi } from "https://deno.land/x/deno_midi/mod.ts";

import {
    f_a_v__prompt
}from "https://deno.land/x/terminal_prompt_functions@0.6/mod.js"

import { f_n_note_from_n_pad_number, f_n_pad_number_from_n_note, f_n_pad_number_from_xy, f_o_trn_from_n_pad_number, f_s_name_array_from_s_name_class } from "./functions.module.js";
import { a_n_u8_sysex_prefix, a_n_u8_sysex_suffix, n_channel_lightness_max, o_hsl_black, o_hsl_white_bright, o_lighting_type__RGB_color, o_scl__launchpad_mini } from "./runtimedata.module.js";
import * as o_mod_classes from "./classes.module.js";
import {
    O_button, 
    O_lighting_type, 
    O_mode, 
    O_mouse_action
} from "./classes.module.js"
import { 
    o_hsl__blue, o_hsl__cyan, o_hsl__green, o_hsl__magenta, o_hsl__red, o_hsl__yellow
    ,o_state__static
} from "./generated_dynamically.module.js";

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

let f_add_missing_objects_to_arrays__in_o_state = function(o_state){
    for(let s_prop in o_state){
        let v = o_state[s_prop];
        let s_name_class = v?.constructor?.name;
        if(s_name_class.startsWith('O_')){
            let s_name_array = f_s_name_array_from_s_name_class(s_name_class.toLowerCase());
            let a_o = o_state[s_name_array]
            if(Array.isArray(a_o) && !a_o?.includes(v)){
                a_o.push(v)
            }
        }
        // console.log(v)
        // console.log(v.constructor.name)
    }
    // console.log(o_state)
}

let o_state = Object.assign(
    o_state__static, 
    {
        a_n_u8__rgb_image: new Uint8Array(),
        n_fps:  33,
        n_ms:  0,
        n_ms_diff:  0,
        n_ms_last:  0,
        n_ms_frame:  1000,
        n_id_frame: 0,
        o_trn_mouse: new O_vec2(0),
        o_mode__mouse_clicker : new O_mode(
            'mouse_clicker', 
            `in this mode a button click sets the mouse to its related position and clicks the left mouse button one time`
        ),
        o_mode__update_mouse_action : new O_mode(
            'update_mouse_action', 
            ''
        ),
        o_mode__change_color : new O_mode(
            'change_color', 
                `a buton does change the color when it is clicked this color will be stored so in this mode the colors of the buttons can be changed`
        ), 
        o_mode__delete_button : new O_mode(
            'delete_button', 
                `in this mode a button can be deleted`
        ), 
        a_o_hsl_palette : [
            o_hsl__red,
            o_hsl__yellow,
            o_hsl__green,
            o_hsl__cyan,
            o_hsl__blue,
            o_hsl__magenta,
        ], 

        o_button__toggler : new O_button(
            11,
            f_n_note_from_n_pad_number(11), 
            f_o_trn_from_n_pad_number(11),
            false,
            o_hsl_white_bright,
            ()=>{},
            function(){

                        
                if(o_state.o_mode == o_state.o_mode__delete_button){
                    this.o_hsl = o_hsl__red
                }

                if(o_state.o_mode == o_state.o_mode__mouse_clicker){
                    this.o_hsl = o_hsl_white_bright
                }
        
                if(o_state.o_mode == o_state.o_mode__update_mouse_action){
                    this.o_hsl = new O_vec3(
                        0, 
                        0.0, 
                        (Math.sin(o_state.n_ms*0.01)*.5+.5)
                    )
                }
                if(o_state.o_mode == o_state.o_mode__change_color){
                    let n_t = (o_state.n_ms * (1/500))%1;
                    console.log(o_state.a_o_hsl_palette)
                    this.o_hsl = o_state.a_o_hsl_palette[
                        parseInt(n_t*o_state.a_o_hsl_palette.length)
                    ]
                }
                // console.log(n_t);
            }, 
            function(){
                let n_idx = (o_state.a_o_mode.indexOf(o_state.o_mode)+1)%o_state.a_o_mode.length;
                o_state.o_mode__last = o_state.o_mode;
                o_state.o_mode = o_state.a_o_mode[n_idx];
                // console.log(o_state.o_mode)
        
                // console.log(o_state.a_o_color_from_palette)
                
            },
            function(){}
        )

    
    }
)

// now we have the problem that we would need to add the objects instanciated in o_state
// to their corresponding arrays...
f_add_missing_objects_to_arrays__in_o_state(o_state);

o_state.n_ms_frame = 1000/o_state.n_fps
o_state.o_mode = o_state.o_mode__mouse_clicker;



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
    console.log(message)

    let n_pad_number = f_n_pad_number_from_n_note(message?.data?.note);

    let o_button = o_state.a_o_button.find(

        o=>o.n_pad_number == n_pad_number
    )
    console.log(o_button)
    console.log(n_pad_number)
    if(o_state.o_mode == o_state.o_mode__update_mouse_action){
        if(!o_button){
            o_button = new O_button(
                n_pad_number,
                f_n_note_from_n_pad_number(n_pad_number), 
                f_o_trn_from_n_pad_number(n_pad_number),
                true,
                o_hsl__yellow,
                function(){
                    this.o_hsl__init = this.o_hsl
                    this.o_hsl__last = this.o_hsl
                    this.n_hue = o_hsl__yellow[0]
                    this.n_saturation = o_hsl__yellow[1]
                    this.n_lightness = o_hsl__yellow[2]
                    this.a_o_mouse_action = []
                    this.n_ms_diff_max_for_storing_mouse_translation = 0
                    this.n_ms_diff_max_for_storing_mouse_translation_and_click = 500
                    this.n_ms_diff_max_for_delete = 100;

                },
                function(){
                    if(this.n_ms_down){

                        let n_ms_diff = o_state.n_ms - this?.n_ms_down;
                        let n_ms_diff_nor = n_ms_diff / this.n_ms_diff_max_for_delete;
                        if(o_state.o_mode == o_state.o_mode__delete_button){                        
                            this.o_hsl = new O_vec3(
                                this.n_hue, 
                                1.0, 
                                1.-n_ms_diff_nor
                            )
                            if(n_ms_diff > this.n_ms_diff_max_for_delete){
                                o_state.a_o_button.splice(
                                    o_state.a_o_button.indexOf(this),
                                    1
                                );
                            }
                        }

                    }
                    // if(this?.n_ms__remaining_because_new_mouse_position_was_set_used_for_flickering_to_indicate_store > 0){

                    //     this.n_ms__remaining_because_new_mouse_position_was_set_used_for_flickering_to_indicate_store
                    //      -= o_state.n_ms_diff;   
                    //      this.o_hsl = (
                    //          f_b_toggle_after_mod_n_ms(
                    //              o_state.n_ms, 
                    //              f_n_close_ms_to_sync_with_fps(111, o_state.n_fps)// this will get the closest possible 
                    //          )
                    //      ) 
                    //          ? o_hsl_black
                    //          : new O_vec3(
                    //             this.n_hue, 
                    //             this.o_hsl[1],
                    //             this.o_hsl[2],
                    //          );

                    //     if(this.n_ms__remaining_because_new_mouse_position_was_set_used_for_flickering_to_indicate_store < 0){
                    //         // reset the original color
                    //        this.o_hsl = this.o_hsl__init
                    //     }
                    // }
                },
                async function(){
                    this.n_ms_down = o_state.n_ms;
                    if(o_state.o_mode == o_state.o_mode__mouse_clicker){

                        for(let o_mouse_action of this?.a_o_mouse_action){
                            
                            o_robot_js.moveMouse(...o_mouse_action.o_trn.a_n_comp)
                            await f_sleep_ms(22);

                            if(o_mouse_action.b_click){
                                o_robot_js.mouseClick();
                                await f_sleep_ms(22);
                            }
                        }

                    }

                    if(o_state.o_mode == o_state.o_mode__change_color){
                        this.o_hsl = f_v_at_n_idx_relative(o_state.a_o_hsl_palette, this.o_hsl, +1);
                        this.n_hue = this.o_hsl[0]
                        this.o_hsl__last = this.o_hsl
                    }

                },
                function(){
                    let n_ms_diff = o_state.n_ms - this?.n_ms_down;

                    if(o_state.o_mode == o_state.o_mode__update_mouse_action){
                        this.a_o_mouse_action.push(
                            new O_mouse_action(
                                o_state.o_trn_mouse.clone(),
                                (n_ms_diff > this.n_ms_diff_max_for_storing_mouse_translation_and_click)
                            )
                        )
                    }

                    this.n_ms_down = false;
                    this.o_hsl = this.o_hsl__last
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
    let a_n_u8__rgb = new Uint8Array([0,0,0])
    let a_n_u8__sysex_message = [
        ...a_n_u8_sysex_prefix,
        ...new Array(
            o_scl__launchpad_mini.f_n_prod_comps()
        )
        .fill(0)
        .map((v,n_idx)=>{
            
            return [
                o_lighting_type__RGB_color.n, 
                f_n_pad_number_from_xy(
                    ...(o_scl__launchpad_mini.f_o_trn__from_n_idx(n_idx)).a_n_comp
                ), 
                ...a_n_u8__rgb
            ]
        }).flat(),
        ...a_n_u8_sysex_suffix
    ]
    midi_out.sendMessage(a_n_u8__sysex_message)


}
let f_render_frame = function(){
    f_clear_screen();
    // console.log('asdf')   
    for(let o_button of o_state.a_o_button){
        o_button?.f_render()
    }
    let a_n_u8__sysex_message = [

        ...a_n_u8_sysex_prefix,
        ...o_state.a_o_button.map((o)=>{
            let a_n_u8__rgb = f_a_n_nor__rgb__from_a_n_nor__hsl(
                ...o.o_hsl.a_n_comp
            ).map(n_nor => {return parseInt(n_nor*127)})
            return [
                o_lighting_type__RGB_color.n, 
                o.n_pad_number,
                ...a_n_u8__rgb
            ]
        }).flat(), 
        ...a_n_u8_sysex_suffix
    ]
    midi_out.sendMessage(a_n_u8__sysex_message)

}

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



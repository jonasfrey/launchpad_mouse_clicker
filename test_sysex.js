import { midi } from "https://deno.land/x/deno_midi/mod.ts";
import {
    O_vec2
} from "https://deno.land/x/vector@1.1/mod.js"
import {
    f_a_v__prompt
}from "https://deno.land/x/terminal_prompt_functions@0.6/mod.js"
import {
    f_sleep_ms , 
    f_a_n_nor__rgb__from_a_n_nor__hsl
}from "https://deno.land/x/handyhelpers@2.6/mod.js";
import { a_n_u8_sysex_prefix, a_n_u8_sysex_suffix, n_channel_lightness_max, o_lighting_type__RGB_color } from "./runtimedata.module.js";
import { f_n_pad_number_from_xy, f_o_trn_from_n_pad_number } from "./functions.module.js";



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

let o_scl = new O_vec2(9,9); // we have a 9x9 matrix

let n_fps = 240;
for(let n_t = 0; n_t< 1000000; n_t+=1){

    await f_sleep_ms(1000/n_fps);

    midi_out.sendMessage(
        new Uint8Array(
            [
                ...a_n_u8_sysex_prefix,
                ...new Array(o_scl.compsmul())
                    .fill(0)
                    .map((v, n_idx)=>{
                        let o_trn = o_scl.from_index(n_idx);
                        console.log(o_trn)
                        let n_pad_number = f_n_pad_number_from_xy(o_trn.n_x, o_trn.n_y);
                        // console.log(n_pad_number)
                        let o_trn2 = f_o_trn_from_n_pad_number(n_pad_number);
                        console.log(o_trn2)
                        console.log('--')
                        let a_n_u8_color = f_a_n_nor__rgb__from_a_n_nor__hsl(
                            ((n_t*0.01)
                            +n_pad_number*0.005
                            )%1,
                             0.5,
                             0.5)//(n_t*0.001)%1)
                            .map(n=>parseInt(n*n_channel_lightness_max));
                            // console.log(a_n_u8_color)

                        return [
                            o_lighting_type__RGB_color.n, 
                            n_pad_number, 
                            ...a_n_u8_color,
                        ]
                    }).flat(),

                ...a_n_u8_sysex_suffix
            ],
    
        )
    )
}
midi_in.on("message", ({ message, deltaTime }) => {

    console.log(message);
})
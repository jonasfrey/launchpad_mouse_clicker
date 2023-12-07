import { midi } from "https://deno.land/x/deno_midi/mod.ts";

import {
    f_a_v__prompt
}from "https://deno.land/x/terminal_prompt_functions@0.6/mod.js"

class O_lighting_type{
    constructor(s_name, n){
        this.s_name = s_name, 
        this.n = n
    }
}
let a_o = [
    [
        ['static_color_from_palette', 0], 
        ['flashing_color', 1], 
        ['pulsing_color', 2], 
        ['RGB_color', 3], 
    ].map(a_v=>{
        return new O_lighting_type(...a_v)
    })
]
// 14
// LED lighting SysEx message
// This message can be sent to Lighting Custom Modes and the Programmer mode to light up LEDs. The
// LED indices used always correspond to those of Programmer mode, regardless of the layout selected:
// Host => Launchpad Mini [MK3]:
// Hex: F0h 00h 20h 29h 02h 0Dh 03h <colourspec> [<colourspec> […]] F7h
// Dec: 240 0 32 41 2 13 3 <colourspec> [<colourspec> […]] 247
// The <colourspec> is structured as follows:
// - Lighting type (1 byte)
// - LED index (1 byte)
// - Lighting data (1 – 3 bytes)
// Lighting types:
// - 0: Static colour from palette, Lighting data is 1 byte specifying palette entry.
// - 1: Flashing colour, Lighting data is 2 bytes specifying Colour B and Colour A.
// - 2: Pulsing colour, Lighting data is 1 byte specifying palette entry.
// - 3: RGB colour, Lighting data is 3 bytes for Red, Green and Blue (127: Max, 0: Min).
// The message may contain up to 81 <colourspec> entries to light up the entire Launchpad Mini [MK3]
// surface.
// Example:
// Host => Launchpad Mini [MK3]:
// Hex: F0h 00h 20h 29h 02h 0Dh 03h 00h 0Bh 0Dh 01h 0Ch 15h 17h 02h 0Dh 25h F7h
// Dec: 240 0 32 41 2 13 3 0 11 13 1 12 21 23 2 13 37 247

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
let f_a_n_nor__rgb__from_hsl = (n_hue_nor, n_saturation_nor, n_lightness_nor) => {
    let n_hue_deg = n_hue_nor*360;
    const k = n => (n +  n_hue_deg / 30) % 12;
    const a = n_saturation_nor * Math.min(n_lightness_nor, 1 - n_lightness_nor);
    const f = n =>
    n_lightness_nor - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [f(0), f(8), f(4)];
};

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

let n_channel_lightness_max = 128;// this is special normally we have 255 values but here maybe hardware restricted only half as much

let n_lighting_type_rgb = 3;
let n_idx_led = 11; // 11 is the index of the led in the bottom left corner
// let a_n_sysexmsg = 
// [0xF0 ,0x00 ,0x20 ,0x29 ,0x02 ,0x0D ,0x03 ,0x00 ,0x0B ,0x0D ,0x01 ,0x0C ,0x15 ,0x17 ,0x02 ,0x0D ,0x25 ,0xF7]
let a_n_u8_sysex_prefix = new Uint8Array([0xF0 ,0x00 ,0x20 ,0x29 ,0x02 ,0x0D ,0x03])
let a_n_u8_sysex_suffix = new Uint8Array([0xF7])

let n_extra_row_buttons_with_text_on = 1;
let n_extra_col_buttons_with_text_on = 1;
let n_extra_col_hidden_i_dont_know_why = 1;
let n_rows = 8+n_extra_row_buttons_with_text_on; 
let n_cols = 8+n_extra_col_buttons_with_text_on+n_extra_col_hidden_i_dont_know_why;
let n_start = 11;
let n_last_is_no_button = 1;
let n_last_is_no_button_but_damn_this_is_also_a_led = 1;
let n_idx_min = n_start;
let n_idx_max = (n_rows*n_cols-n_last_is_no_button+n_last_is_no_button_but_damn_this_is_also_a_led)+n_idx_min;
let n_idx_range = n_idx_max-n_idx_min;
for(let n_t = 0; n_t< 1000000; n_t+=1){

    let n_row = 2; 
    let n_col = 0;

    midi_out.sendMessage(
        new Uint8Array(
            // [
            // n_lighting_type_rgb, 
            // n_idx_led, 
            // ...a_n_u8_color
            // ]
            [
                ...a_n_u8_sysex_prefix,
                // ...new Array((8+1)*(8+1))
                //     .fill(0)
                //     .map((v, n_idx)=>{
                //         let n_idx_pad = n_idx +n_start;
                //         let n_mul = (n_idx == (parseInt((n_t*0.02)%(n_idx_range))+11))?1: 0;
                //         n_mul = (n_idx_pad == (22)) ? 1: 0;
                //         let a_n_u8_color = f_a_n_nor__rgb__from_hsl(
                //             ((n_t*0.001)+n_idx_pad*0.05)%1,
                //              0.5,
                //              0.5*n_mul)//(n_t*0.001)%1)
                //             .map(n=>parseInt(n*n_channel_lightness_max));
                //             console.log(a_n_u8_color)

                //         return [
                //             n_lighting_type_rgb, 
                //             n_idx, 
                //             ...a_n_u8_color,
                //         ]
                //     }).flat(),
                ...[
                    3, 
                    // 11+(9*9)+7,
                    // 11 + 8*n_row+(n_row*1)+n_col,
                    // 11 //start
                    //   +8//last from first row
                    //   +1// hidden one
                    //   +8+1 // last from second row? 
                    //   +1 // hidden one, 
                    //   +8+1//last from third
                    (9*10)+1
                    ,...[127,127, 127]
                ],
                ...a_n_u8_sysex_suffix
            ],
    
        )
    )
}

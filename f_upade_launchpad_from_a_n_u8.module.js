
import { midi } from "https://deno.land/x/deno_midi/mod.ts";
import {
    O_vec2
} from "https://deno.land/x/vector@1.1/mod.js"
import {
    f_a_v__prompt
}from "https://deno.land/x/terminal_prompt_functions@0.6/mod.js"
import {
    f_sleep_ms 
}from "https://deno.land/x/handyhelpers/mod.js";
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

let n_channel_lightness_max = 127;// this is special normally we have 255 values but here maybe hardware restricted only half as much

let n_lighting_type_rgb = 3;
let n_idx_led = 11; // 11 is the index of the led in the bottom left corner
// let a_n_sysexmsg = 
// [0xF0 ,0x00 ,0x20 ,0x29 ,0x02 ,0x0D ,0x03 ,0x00 ,0x0B ,0x0D ,0x01 ,0x0C ,0x15 ,0x17 ,0x02 ,0x0D ,0x25 ,0xF7]
let a_n_u8_sysex_prefix = new Uint8Array([0xF0 ,0x00 ,0x20 ,0x29 ,0x02 ,0x0D ,0x03])
let a_n_u8_sysex_suffix = new Uint8Array([0xF7])
// so the index for the pad can be looked at this way

// the first decimal place stands for the row 
// and the second decimal place stands for the column 
// so 23 would be 
//    2nd row
//     |
//     3rd column

let f_n_pad_number_from_xy = function(
    n_x, 
    n_y
){
    return (10*(n_y+1))+(n_x+1)
    // parseInt(`${n_y+1}${n_x+1}`)
    // return 
}
let f_o_trn_from_n_pad_number = function(
    n_pad_number
){
    return new O_vec2(
        (n_pad_number%10)-1,
        Math.trunc(n_pad_number/10)-1
    )
}

let o_scl = new O_vec2(9,9); // we have a 9x9 matrix

midi_in.on("message", ({ message, deltaTime }) => {

    console.log(message);
})

let f_upade_launchpad_from_a_n_u8 = function(
    a_n_u8,
    o_scl_input,
){
    let o_scl_lp = new O_vec2(9,9);
    // f_sleep_ms(1000/30)
    console.log('render image')
    midi_out.sendMessage(
        new Uint8Array(
            [
                ...a_n_u8_sysex_prefix,
                ...new Array(o_scl_lp.compsmul())
                    .fill(0)
                    .map((v, n_idx_lp)=>{
                        let o_trn_lp = o_scl_lp.from_index(n_idx_lp);
                        let o_trn_lp_nor = o_trn_lp.div(o_scl_lp);
                        let o_trn_big = o_trn_lp_nor.mul(o_scl_input);
                        let n_idx_big = o_trn_big.to_index(o_scl);
                        let n_pad_number = f_n_pad_number_from_xy(...o_trn_lp.a_n_comp);
                        let a_n__color = [
                            parseInt((a_n_u8[(n_idx_lp*4)+0]/255)*n_channel_lightness_max),
                            parseInt((a_n_u8[(n_idx_lp*4)+1]/255)*n_channel_lightness_max),
                            parseInt((a_n_u8[(n_idx_lp*4)+2]/255)*n_channel_lightness_max),
                        ]
                        // console.log(a_n__color)
                        console.log(n_pad_number)
                        return [
                            n_lighting_type_rgb, 
                            n_pad_number, 
                            ...a_n__color
                        ]
                    }).flat(),

                ...a_n_u8_sysex_suffix
            ],
    
        )
    )


}

export {
    f_upade_launchpad_from_a_n_u8
}
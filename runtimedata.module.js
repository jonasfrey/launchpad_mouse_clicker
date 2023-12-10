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
import {
    O_vec2, 
    O_vec3
} from "https://deno.land/x/vector@1.4/mod.js"
import { O_lighting_type } from "./classes.module.js";


let a_n_u8_sysex_prefix = new Uint8Array([0xF0 ,0x00 ,0x20 ,0x29 ,0x02 ,0x0D ,0x03])
let a_n_u8_sysex_suffix = new Uint8Array([0xF7])
let n_channel_lightness_max = 127;// this is special normally we have 255 values but here maybe hardware restricted only half as much

let o_lighting_type__static_color_from_palette = new O_lighting_type(...['static_color_from_palette', 0]) 
let o_lighting_type__flashing_color = new O_lighting_type(...['flashing_color', 1]) 
let o_lighting_type__pulsing_color = new O_lighting_type(...['pulsing_color', 2]) 
let o_lighting_type__RGB_color = new O_lighting_type(...['RGB_color', 3]) 
let o_scl__launchpad_mini = new O_vec2(
    9,9
)

let o_hsl_white_bright = new O_vec3(0,1.0,1.0);
let o_hsl_black = new O_vec3(0,0,0);

export {
    o_hsl_white_bright,
    o_hsl_black,
    a_n_u8_sysex_prefix,
    a_n_u8_sysex_suffix, 
    n_channel_lightness_max, 
    o_lighting_type__static_color_from_palette,
    o_lighting_type__flashing_color,
    o_lighting_type__pulsing_color,
    o_lighting_type__RGB_color, 
    o_scl__launchpad_mini
}
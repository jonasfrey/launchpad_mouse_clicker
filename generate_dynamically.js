let s_path_file = `./generated_dynamically.module.js`

import * as o_mod_classes from "./classes.module.js";
import { f_s_name_array_from_s_name_class } from "./functions.module.js";

let a_s_name_to_export = [];


await Deno.writeTextFile(
    s_path_file, 
    `
        import * as o_mod_classes from './classes.module.js'
        import {
            O_vec2, 
            O_vec3
        } from "https://deno.land/x/vector@1.4/mod.js"
        ${
            [
                'red',
                'yellow',
                'green',
                'cyan',
                'blue', 
                'magenta', 
            ].map((s, n_idx)=>{
                let s_name = `o_hsl__${s}`;
                a_s_name_to_export.push(s_name)
                return `let ${s_name} = new O_vec3(${n_idx*((1/360)*30)}, 1.0, 0.5);`
            }).join('\n')
        }
        let o_state__static = ${JSON.stringify(
            {
                ...Object.assign({}, 
                    ...Object.values(o_mod_classes).map(
                        O_class=>{
                            return {
                                [O_class.name.toLowerCase()]: {},
                                [f_s_name_array_from_s_name_class(O_class.name.toLowerCase())]: []
                            }
                        }
                    )
                ),   
            }, 
            null, 
            4
        )}
        export {
            o_state__static,
            ${a_s_name_to_export.join('\n,')}
        }    
    `
)
import {
    f_websersocket_serve, 
    f_v_before_return_response__fileserver
} from "https://deno.land/x/websersocket@0.1/mod.js"
import { f_upade_launchpad_from_a_n_u8 } from "./f_upade_launchpad_from_a_n_u8.module.js";
import {
    O_vec2
} from "https://deno.land/x/vector@1.1/mod.js"
let s_path_file_current = new URL(import.meta.url).pathname;
let s_path_folder_current = s_path_file_current.split('/').slice(0, -1).join('/'); 
// console.log(s_path_folder_current)

f_upade_launchpad_from_a_n_u8(
    new Array(9*9*4).fill(0), 
    new O_vec2(9,9)                
)

let f_handler = async function(o_request){
    if(o_request.headers.get('Upgrade') == 'websocket'){

        const { 
            socket: o_socket,
            response: o_response
        } = Deno.upgradeWebSocket(o_request);

        o_socket.addEventListener("open", () => {
            console.log("a client connected!");
            o_socket.send('hello from websocket');
        });
        
        o_socket.addEventListener("message", async (event) => {
            console.log(`a message was received ${event.data}`)
            // f_upade_launchpad_from_a_n_u8(
            //     event.data.a_n_u8, 
            //     new O_vec2(event.data.o_scl)
            // );
            console.log(event.data);
            f_upade_launchpad_from_a_n_u8(new Uint8Array(event.data), new O_vec2(9,9))
        });
        
        return o_response;
    }
    return f_v_before_return_response__fileserver(
        o_request,
        `${s_path_folder_current}/`
    )
}

await f_websersocket_serve(
    [
        {
            n_port: 8080, 
            b_https: false, 
            s_hostname: 'localhost',
            f_v_before_return_response: f_handler 
        }, 
        {
            n_port: 8443, 
            b_https: true, 
            s_hostname: 'localhost',
            f_v_before_return_response: f_handler
        }
    ]
)
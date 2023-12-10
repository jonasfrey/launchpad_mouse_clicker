
import {
    O_vec2
} from "https://deno.land/x/vector@1.1/mod.js"

let f_s_name_array_from_s_name_class = function(s){
    return `a_${s.trim().toLowerCase()}`
}

let f_n_note_from_n_pad_number = function(n_pad_number){
    let o_trn = f_o_trn_from_n_pad_number(n_pad_number);
    if(
        o_trn.n_x < 8
        || 
        o_trn.n_y < 8
    ){
        let n_col = parseInt(o_trn.n_x/4);
        return 36+(o_trn.n_y*4)+o_trn.n_x+(n_col*32);
    }
    return n_pad_number
}
let f_n_pad_number_from_xy = function(
    n_x, 
    n_y
){
    // so the index for the pad can be looked at this way

    // the first decimal place stands for the row 
    // and the second decimal place stands for the column 
    // so 23 would be 
    //    2nd row
    //     |
    //     3rd column
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
let f_n_pad_number_from_n_note = function(
    n_note
){
    if(n_note >= 68 && n_note <= 99){
        n_note -= (4 * 8);
    }
    if(n_note >= 36 && n_note <= 67){
        return f_n_pad_number_from_xy(
            n_note % 4,
            parseInt((n_note-36)/4)
        )
    }
    return n_note
}
export {
    f_n_note_from_n_pad_number,
    f_n_pad_number_from_xy,
    f_o_trn_from_n_pad_number, 
    f_s_name_array_from_s_name_class, 
    f_n_pad_number_from_n_note 
}
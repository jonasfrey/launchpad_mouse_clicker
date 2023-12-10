class O_mode{
    constructor(
        s_name, 
        s_description
    ){
        this.s_name = s_name
        this.s_description = s_description
    }
}
class O_mouse_action{
    constructor(
        o_trn,
        b_click, 
    ){
        this.o_trn = o_trn
        this.b_click = b_click
    }
}

class O_lighting_type{
    constructor(s_name, n){
        this.s_name = s_name, 
        this.n = n
    }
}
class O_button{
    constructor(
        n_pad_number, 
        n_note, 
        o_trn, 
        b_down,
        o_hsl,  
        f_init,
        f_render, 
        f_on_down, 
        f_on_up
    ){
        this.n_pad_number = n_pad_number
        this.n_note = n_note
        this.o_trn = o_trn,
        this.b_down = b_down
        this.o_hsl = o_hsl 
        this.f_init = f_init
        this.f_render = f_render
        this.f_on_down = f_on_down 
        this.f_on_up = f_on_up
        this.f_init()
    }
}

export {
    O_lighting_type,
    O_button, 
    O_mode, 
    O_mouse_action
}
class O_mode{
    constructor(
        s_name, 
        s_description
    ){
        this.s_name = s_name
        this.s_description = s_description
    }
}
class O_color_from_palette{
    constructor(
        s_name, 
        n_number
    ){
        this.s_name = s_name
        this.n_number = n_number
    }
}
class O_button{
    constructor(
        n_number, 
        b_down,
        o_color_from_palette,  
        f_render, 
        f_on_down, 
        f_on_up
    ){
        this.n_number = n_number
        this.b_down = b_down
        this.o_color_from_palette = o_color_from_palette 
        this.f_render = f_render
        this.f_on_down = f_on_down 
        this.f_on_up = f_on_up
    }
}
let o_s_name_class_O_class = {
    O_button, 
    O_color_from_palette,
    O_mode, 
}
let a_o_class = Object.values(o_s_name_class_O_class);
export {
    a_o_class,
    o_s_name_class_O_class,
}
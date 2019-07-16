import {SHIFT_X} from './filter1d-type';
import shiftX from './shiftX';

export default function applyFilter(filterOption,data){

    switch(filterOption.kind){
         case SHIFT_X:
             return {x:shiftX(data.x,filterOption.value),y:data.y};
        default: 
        return null;
    }
}
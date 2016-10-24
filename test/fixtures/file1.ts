import './sub/another';
import { lol } from '../outer/include'

export default (ok: Hi) => {
    if (<boolean>lol === false) {
        return ok.ok;
    }
}
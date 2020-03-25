import Base  from '../../Base.mjs';
import { dumpUser } from '../../../utils/dumps.mjs';
import User         from '../../../domain-model/User.mjs';

export default class UsersShow extends Base {
    static validationRules = {
        id : [ 'required', 'uuid' ]
    };

    async execute({ id }) {
        const user = await User.findById(id);

        return { data: dumpUser(user) };
    }
}

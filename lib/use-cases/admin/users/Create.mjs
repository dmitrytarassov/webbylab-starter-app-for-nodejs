import {
    Exception as X
} from '../../../../packages.mjs';

import Base         from '../../Base.mjs';
import { dumpUser } from '../../utils/dumps.mjs';
import User         from '../../../domain-model/User.mjs';
import DMX          from '../../../domain-model/X.mjs';
import StoredTriggerableAction, { TYPES as ActionTypes } from '../../../domain-model/StoredTriggerableAction.mjs';

const DEFAULT_PASSWORD = 'password';

export default class AdminUsersCreate extends Base {
    static validationRules = {
        data : [ 'required', { 'nested_object' : {
            email : [ 'required', 'email', 'to_lc' ]
        } } ]
    };

    async execute({ data }) {
        try {
            const user = await User.create({
                password       : DEFAULT_PASSWORD,
                agreeWithTerms : true,
                ...data
            });

            const action = await StoredTriggerableAction.create({
                type    : ActionTypes.ACTIVATE_USER,
                payload : { userId: user.id }
            });

            try {
                await this.notificator.notify('ACTIVATE_USER', data.email, {
                    ...user,
                    actionId : action.id
                });
            } catch (err) {} // eslint-disable-line no-trailing-spaces, no-empty

            return { data: dumpUser(user) };
        } catch (x) {
            if (x instanceof DMX.NotUnique) {
                throw new X({
                    code   : 'NOT_UNIQUE',
                    fields : { [x.field]: 'NOT_UNIQUE' }
                });
            }

            throw x;
        }
    }
}

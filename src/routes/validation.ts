import { validate } from 'class-validator';
import { RestoNodeError } from './errorHandlers';

export default async <T>(entity: T) => {
    const errors = await validate(entity, { validationError: { target: false } });
    if (errors.length > 0) {
        const validationErrorMessage = errors.reduce((acc, e) => {
            const constraints = Object.keys(e.constraints).map(_ => e.constraints[_]).join(' and ');
            return `${e.property} ${constraints}. ${acc}`;
        }, '');

        throw new RestoNodeError(400, validationErrorMessage);
    }
};

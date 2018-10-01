import { validate } from 'class-validator';
import { RestoNodeError } from './errorHandlers';

export default async <T>(entity: T) => {
    const errors = await validate(entity, { validationError: { target: false, value: false } });
    if (errors.length > 0) {
        throw new RestoNodeError(400, errors);
    }
};

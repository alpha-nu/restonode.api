import { RequestHandler, Request, Response, NextFunction } from 'express';

export class RestoNodeError {
    private code: number;
    private error: string;
    constructor(code: number, error: any) {
        this.code = code;
        this.error = error;
    }
    public getError() {
        return ({ code: this.code, message: this.error });
    }
}

export const safeHandler = (handler: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await handler(req, res, next);
    } catch (e) {
        next(e);
    }
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof RestoNodeError) {
        const details = err.getError();
        res.status(details.code).json(details);
    } else {
        // tslint:disable-next-line:no-console
        console.log(err);
        res.status(500).json({ message: 'something terrible happened' });
    }
};

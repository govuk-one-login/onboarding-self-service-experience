import * as path from 'path';
import {Express} from 'express-serve-static-core';
import {configure, render,} from 'nunjucks';

const configureViews = (
    app: Express,
    viewPath = '../../src/views',
) => {
    configure(
        [
            path.join(__dirname, viewPath),
            'node_modules/govuk-frontend/',
        ],
        {
            autoescape: true,
            noCache: true,
            express: app,
        },
    );

    app.engine('njk', render);
};

export default configureViews;

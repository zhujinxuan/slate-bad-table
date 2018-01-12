// @flow

import createSchema from './schema/index';
import createUtils from './utils/index';
import Options, { type OptionsFormat } from './options';

type typePlugins = {
    schema: Object,
    utils: Object,
    onKeyDown: Function,
    rules: Object
};

function createBadTablePlugin(pluginOpts: OptionsFormat): typePlugins {
    const opts = new Options(pluginOpts);
    const schema = createSchema(opts);
    const rules = {};
    const utils = createUtils(opts);
    const onKeyDown = () => null;
    return {
        schema,
        utils,
        onKeyDown,
        rules
    };
}

export default createBadTablePlugin;

// @flow

import createSchema from './schema/index';
import createUtils from './utils/index';
import createChanges from './changes/index';
import Options, { type OptionsFormat } from './options';

type typePlugins = {
    schema: Object,
    utils: Object,
    onKeyDown: Function,
    rules: Object,
    changes: Object
};

function createBadTablePlugin(pluginOpts: OptionsFormat): typePlugins {
    const opts = new Options(pluginOpts);
    const schema = createSchema(opts);
    const rules = {};
    const utils = createUtils(opts);
    const onKeyDown = () => null;
    const changes = createChanges(opts);
    return {
        schema,
        utils,
        onKeyDown,
        rules,
        changes
    };
}

export default createBadTablePlugin;

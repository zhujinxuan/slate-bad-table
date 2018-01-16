// @flow

import createSchema from './schema/index';
import createUtils from './utils/index';
import createChanges from './changes/index';
import Options, { type OptionsFormat } from './options';
import createRulesPatch from './rules/index';

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
    const rulesPatch = createRulesPatch(opts);
    const utils = createUtils(opts);
    const onKeyDown = () => null;
    const changes = createChanges(opts);
    return {
        schema,
        utils: { ...utils, ...rulesPatch.utils },
        onKeyDown,
        rules: rulesPatch.rules,
        changes
    };
}

export default createBadTablePlugin;

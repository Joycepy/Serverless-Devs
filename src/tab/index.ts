const omelette = require('omelette');
import core from '../utils/core';
import { getYamlPath } from '../utils';
import path from 'path';

const { lodash, fse } = core;

const { get, keys, isPlainObject } = lodash;

function getComponentPath(componentName: string) {
  let filePath = path.join(core.getRootHome(), 'components', 'devsapp.cn', componentName);
  if (!fse.existsSync(filePath)) {
    filePath = path.join(core.getRootHome(), 'components', 'devsapp.cn', 'devsapp', componentName);
  }
  if (fse.existsSync(filePath)) {
    return filePath;
  }
}

(async () => {
  const spath = await getYamlPath();
  const completion = omelette('s');
  let tmp = {};
  if (spath) {
    const yamlData = await core.getYamlContent(spath);
    const serviceList = keys(get(yamlData, 'services'));
    if (serviceList.length > 1) {
      for (const key of serviceList) {
        const component = get(yamlData, ['services', key, 'component']);
        const filePath = getComponentPath(component);
        const data = [];
        if (filePath) {
          const publishPath = path.join(filePath, 'publish.yaml');
          const publishContent = await core.getYamlContent(publishPath);
          const commands = publishContent.Commands;
          if (commands) {
            for (const o in commands) {
              const ele = commands[o];
              if (isPlainObject(ele)) {
                for (const i in ele) {
                  tmp[i] = [];
                  data.push(i);
                }
              } else {
                tmp[o] = [];
                data.push(o);
              }
            }
          }
        }
        tmp[key] = data;
      }
    } else {
      const component = get(yamlData, ['services', serviceList[0], 'component']);
      const filePath = getComponentPath(component);
      if (filePath) {
        const publishPath = path.join(filePath, 'publish.yaml');
        const publishContent = await core.getYamlContent(publishPath);
        const commands = publishContent.Commands;
        if (commands) {
          for (const key in commands) {
            const ele = commands[key];
            if (isPlainObject(ele)) {
              for (const i in ele) {
                tmp[i] = [];
              }
            } else {
              tmp[key] = [];
            }
          }
        }
      }
    }
  } else {
    tmp = {
      config: ['add', 'get', 'delete'],
      init: [],
      cli: ['fc'],
      verify: [],
      set: ['registry', 'analysis', 'workspace'],
      clean: [],
      component: [],
      edit: [],
    };
  }
  completion.tree(tmp).init();
})();

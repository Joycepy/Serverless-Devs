import tabtab from 'tabtab';
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
  const env = tabtab.parseEnv(process.env);
  if (!env.complete) return;

  const spath = await getYamlPath();
  if (spath) {
    const yamlData = await core.getYamlContent(spath);
    const serviceList = keys(get(yamlData, 'services'));
    if (serviceList.length > 1) {
      const tmp = [];
      for (const key of serviceList) {
        const component = get(yamlData, ['services', key, 'component']);
        const filePath = getComponentPath(component);
        if (filePath) {
          const publishPath = path.join(filePath, 'publish.yaml');
          const publishContent = await core.getYamlContent(publishPath);
          const commands = publishContent.Commands;
          if (commands) {
            for (const o in commands) {
              const ele = commands[o];
              if (isPlainObject(ele)) {
                for (const i in ele) {
                  tmp.push(i);
                }
              } else {
                tmp.push(o);
              }
            }
          }
        }
        tmp.push({ name: key, description: `Specify service to operate.` });
      }
      tabtab.log(tmp);
    } else {
      const component = get(yamlData, ['services', serviceList[0], 'component']);
      const filePath = getComponentPath(component);
      if (filePath) {
        const publishPath = path.join(filePath, 'publish.yaml');
        const publishContent = await core.getYamlContent(publishPath);
        const commands = publishContent.Commands;
        if (commands) {
          const tmp = [];
          for (const key in commands) {
            const ele = commands[key];
            if (isPlainObject(ele)) {
              for (const i in ele) {
                tmp.push(i === 'deploy' ? { name: i, description: ele[i] } : i);
              }
            } else {
              tmp.push(key === 'deploy' ? { name: key, description: ele } : key);
            }
          }
          tabtab.log(tmp);
        }
      }
    }
  } else {
    if (env.prev === 'config') {
      return tabtab.log(['add', 'get', 'delete']);
    }
    if (env.prev === 'cli') {
      return tabtab.log(['fc']);
    }
    if (env.prev === 'set') {
      return tabtab.log(['registry', 'analysis', 'workspace']);
    }
    tabtab.log(['config', 'init', 'cli', 'verify', 'set', 'clean', 'component', 'edit']);
  }
})();

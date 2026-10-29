import { useMemo } from 'react';
import { formatBuildDate, shortCommit } from '../model/appInfo';
import { getAppInfo } from '../repository/appInfoRepository';

export function useAppInfoControl() {
  return useMemo(() => {
    const { version, build } = getAppInfo();
    return {
      version,
      commit: shortCommit(build.commitHash),
      commitFull: build.commitHash,
      branch: build.branch,
      dirty: build.dirty,
      builtAtLabel: formatBuildDate(build.builtAt),
    };
  }, []);
}

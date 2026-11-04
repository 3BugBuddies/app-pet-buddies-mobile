import { useMemo } from 'react';
import { APP_CREDITS, APP_GROUP, APP_MEMBERS, APP_PURPOSE } from '../model/appCredits';
import { formatBuildDate, shortCommit } from '../model/appInfo';
import { getAppInfo } from '../repository/appInfoRepository';

export function useAppInfoControl() {
  return useMemo(() => {
    const { version, build } = getAppInfo();
    return {
      purpose: APP_PURPOSE,
      group: APP_GROUP,
      members: APP_MEMBERS,
      credits: APP_CREDITS,
      version,
      commit: shortCommit(build.commitHash),
      commitFull: build.commitHash,
      dirty: build.dirty,
      builtAtLabel: formatBuildDate(build.builtAt),
    };
  }, []);
}

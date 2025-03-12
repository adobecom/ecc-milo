export const getCaasTags = (() => {
  let cache;
  let promise;

  return () => {
    if (cache) {
      return cache;
    }

    if (!promise) {
      promise = fetch('https://www.adobe.com/chimera-api/tags')
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }

          throw new Error('Failed to load tags');
        })
        .then((data) => {
          cache = data;
          return data;
        })
        .catch((err) => {
          window.lana?.log(`Failed to load products map JSON. Error: ${err}`);
          throw err;
        });
    }

    return promise;
  };
})();

export function deepGetTagByPath(pathArray, index, tags = {}) {
  let currentTag = tags;

  pathArray.forEach((path, i) => {
    if (i <= index && path) {
      currentTag = currentTag.tags[path];
    }
  });

  return currentTag;
}

export function deepGetTagByTagID(tagID, tags = {}) {
  const tagIDs = tagID.replace('caas:', '').split('/');
  let currentTag = tags;

  tagIDs.forEach((tag) => {
    currentTag = currentTag.tags[tag];
  });

  return currentTag;
}

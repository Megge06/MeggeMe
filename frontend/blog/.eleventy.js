module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/script.js": "script.js" });

  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md").reverse();
  });

  // Custom filters to generate the Atom feed natively.
  eleventyConfig.addFilter("dateToRfc3339", function (date) {
    if (!date) return new Date().toISOString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  });

  eleventyConfig.addFilter(
    "getNewestCollectionItemDate",
    function (collection) {
      if (!collection || collection.length === 0)
        return new Date().toISOString();
      const dates = collection
        .map((item) => new Date(item.date).getTime())
        .filter((t) => !isNaN(t));
      if (dates.length === 0) return new Date().toISOString();
      return new Date(Math.max(...dates)).toISOString();
    },
  );

  eleventyConfig.addFilter(
    "htmlToAbsoluteUrls",
    function (htmlContent, siteUrl) {
      if (!htmlContent) return "";
      const cleanSiteUrl = siteUrl.endsWith("/")
        ? siteUrl.slice(0, -1)
        : siteUrl;

      return htmlContent.replace(
        /(src|href)="\/([^"]+)"/g,
        (match, attr, path) => {
          return `${attr}="${cleanSiteUrl}/${path}"`;
        },
      );
    },
  );

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    pathPrefix: "/blog/",
  };
};

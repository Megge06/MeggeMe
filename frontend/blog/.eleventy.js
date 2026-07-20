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
  // This bypasses the global HTML Base Plugin to keep your asset paths intact.

  // 1. Format dates to ISO-8601 / RFC3339
  eleventyConfig.addFilter("dateToRfc3339", function (date) {
    if (!date) return new Date().toISOString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  });

  // 2. Find the date of the newest post in your collection
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

  // 3. Convert relative asset/link paths inside post markdown to absolute URLs for feed readers
  eleventyConfig.addFilter(
    "htmlToAbsoluteUrls",
    function (htmlContent, siteUrl) {
      if (!htmlContent) return "";
      const cleanSiteUrl = siteUrl.endsWith("/")
        ? siteUrl.slice(0, -1)
        : siteUrl;

      // Prefix root-relative paths like src="/..." or href="/..." with your domain URL
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

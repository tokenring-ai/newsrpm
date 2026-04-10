import newsrpmArticle from "./commands/newsrpm/article.ts";
import newsrpmBody from "./commands/newsrpm/body.ts";
import newsrpmIndex from "./commands/newsrpm/index.ts";
import newsrpmProviders from "./commands/newsrpm/providers.ts";
import newsrpmSearch from "./commands/newsrpm/search.ts";
import newsrpmUpload from "./commands/newsrpm/upload.ts";

export default [
  newsrpmIndex,
  newsrpmSearch,
  newsrpmArticle,
  newsrpmProviders,
  newsrpmBody,
  newsrpmUpload,
];

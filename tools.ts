import getArticleById from "./tools/getArticleById.ts";
import getArticleBySlug from "./tools/getArticleBySlug.ts";
import getBody from "./tools/getBody.ts";
import listProviders from "./tools/listProviders.ts";
import renderBody from "./tools/renderBody.ts";
import searchArticles from "./tools/searchArticles.ts";
import searchIndexedData from "./tools/searchIndexedData.ts";
import uploadArticle from "./tools/uploadArticle.ts";

export default {
  searchIndexedData,
  searchArticles,
  getArticleBySlug,
  getArticleById,
  uploadArticle,
  listProviders,
  getBody,
  renderBody,
}
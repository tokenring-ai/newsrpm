import {default as getArticleById} from "./tools/getArticleById.ts";
import {default as getArticleBySlug} from "./tools/getArticleBySlug.ts";
import {default as getBody} from "./tools/getBody.ts";
import {default as listProviders} from "./tools/listProviders.ts";
import {default as renderBody} from "./tools/renderBody.ts";
import {default as searchArticles} from "./tools/searchArticles.ts";
import {default as searchIndexedData} from "./tools/searchIndexedData.ts";
import {default as uploadArticle} from "./tools/uploadArticle.ts";

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